const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');
const { createNotification } = require('../utils/notifications');

// @route   POST api/events
// @desc    Create a new event
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized to create events' });
        }

        const newEvent = new Event({
            ...req.body,
            createdBy: req.user.id
        });

        const event = await newEvent.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/events
// @desc    Get all events with optional filtering
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { type, search, fromDate, toDate } = req.query;
        let query = {};

        // Filter by type
        if (type) {
            query.type = type;
        }

        // Filter by date range
        if (fromDate || toDate) {
            query.date = {};
            if (fromDate) query.date.$gte = new Date(fromDate);
            if (toDate) query.date.$lte = new Date(toDate);
        }

        // Search by name or description
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const events = await Event.find(query).sort({ date: 1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/events/:id/register
// @desc    Register for an event
// @access  Private
router.post('/:id/register', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Check if event is full
        if (event.registeredUsers.length >= event.capacity) {
            return res.status(400).json({ msg: 'Event is full' });
        }

        // Check if user is already registered
        if (event.registeredUsers.includes(req.user.id)) {
            return res.status(400).json({ msg: 'Already registered for this event' });
        }

        event.registeredUsers.push(req.user.id);
        await event.save();

        // Add event to user's registered events
        const user = await User.findById(req.user.id);
        user.registeredEvents.push(event._id);
        await user.save();

        // Create registration notification
        await createNotification(
            req.user.id,
            event._id,
            'registration',
            `You have successfully registered for ${event.name}`
        );

        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized to delete events' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        await event.remove();
        res.json({ msg: 'Event removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized to update events' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Update event fields
        const { name, description, date, time, location, type, capacity } = req.body;
        
        // Only allow capacity increase or if no users are registered
        if (capacity < event.registeredUsers.length) {
            return res.status(400).json({ msg: 'Cannot reduce capacity below number of registered users' });
        }

        event.name = name;
        event.description = description;
        event.date = date;
        event.time = time;
        event.location = location;
        event.type = type;
        event.capacity = capacity;

        await event.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/events/:id/register
// @desc    Cancel event registration
// @access  Private
router.delete('/:id/register', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Remove user from event's registered users
        event.registeredUsers = event.registeredUsers.filter(
            userId => userId.toString() !== req.user.id
        );
        await event.save();

        // Remove event from user's registered events
        const user = await User.findById(req.user.id);
        user.registeredEvents = user.registeredEvents.filter(
            eventId => eventId.toString() !== req.params.id
        );
        await user.save();

        // Create cancellation notification
        await createNotification(
            req.user.id,
            event._id,
            'cancellation',
            `Your registration for ${event.name} has been cancelled`
        );

        res.json({ msg: 'Registration cancelled' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/events/recommended
// @desc    Get events based on user preferences
// @access  Private
router.get('/recommended', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const events = await Event.find({
            type: { $in: user.preferences },
            date: { $gte: new Date() }
        }).sort({ date: 1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/events/:id/comments
// @desc    Add a comment to an event
// @access  Private
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        const newComment = {
            user: req.user.id,
            text: req.body.text
        };

        event.comments.unshift(newComment);
        await event.save();

        // Populate user information for the new comment
        const populatedEvent = await Event.findById(req.params.id)
            .populate('comments.user', 'name');

        res.json(populatedEvent.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/events/:id/ratings
// @desc    Rate an event
// @access  Private
router.post('/:id/ratings', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Check if user has already rated
        const existingRating = event.ratings.find(
            rating => rating.user.toString() === req.user.id
        );

        if (existingRating) {
            existingRating.score = req.body.score;
        } else {
            event.ratings.push({
                user: req.user.id,
                score: req.body.score
            });
        }

        event.averageRating = event.calculateAverageRating();
        await event.save();

        res.json(event.ratings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/events/calendar
// @desc    Get events in calendar format
// @access  Private
router.get('/calendar', auth, async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        const calendarEvents = events.map(event => ({
            id: event._id,
            title: event.name,
            start: event.date,
            end: event.date,
            description: event.description,
            location: event.location,
            allDay: true
        }));
        res.json(calendarEvents);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/events/recurring
// @desc    Create a recurring event
// @access  Private (Admin only)
router.post('/recurring', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.isAdmin) {
            return res.status(403).json({ msg: 'Not authorized to create events' });
        }

        const { frequency, endDate, ...eventDetails } = req.body;
        const events = [];

        let currentDate = new Date(eventDetails.date);
        const recurringEndDate = new Date(endDate);

        while (currentDate <= recurringEndDate) {
            const newEvent = new Event({
                ...eventDetails,
                date: currentDate,
                createdBy: req.user.id,
                isRecurring: true,
                recurringPattern: { frequency, endDate }
            });

            await newEvent.save();
            events.push(newEvent);

            // Calculate next date based on frequency
            switch (frequency) {
                case 'daily':
                    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
                    break;
                case 'weekly':
                    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
                    break;
                case 'monthly':
                    currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
                    break;
            }
        }

        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/events/history
// @desc    Get user's event history
// @access  Private
router.get('/history', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('registeredEvents');
        const events = user.registeredEvents;
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router; 