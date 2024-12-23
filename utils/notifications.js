const Notification = require('../models/Notification');

const createNotification = async (userId, eventId, type, message) => {
    try {
        const notification = new Notification({
            user: userId,
            event: eventId,
            type,
            message
        });

        await notification.save();
        return notification;
    } catch (err) {
        console.error('Error creating notification:', err);
        return null;
    }
};

module.exports = { createNotification }; 