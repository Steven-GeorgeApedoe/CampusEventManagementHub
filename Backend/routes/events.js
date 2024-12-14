const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

// Get all events
router.get("/", async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: "Error fetching events" });
    }
});

// Create new event
router.post("/", async (req, res) => {
    const { name, date, time, location, capacity } = req.body;
    try {
        const event = new Event({ name, date, time, location, capacity });
        await event.save();
        res.status(201).json({ message: "Event created successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error creating event" });
    }
});

// Add this route to your existing events.js
router.delete("/:id", async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting event" });
    }
});

module.exports = router;
