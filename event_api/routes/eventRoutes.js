// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');
const eventController = require('../controllers/eventController');

// Public route to get all events
router.get('/', eventController.getAllEvents);
router.get('/events', eventController.getAllEvents);

// Admin only - Create event (with image URL)
router.post('/create', verifyToken, isAdmin, eventController.createEvent);

// Dashboard stats (optional)
router.get('/dashboard', verifyToken, isAdmin, async (req, res) => {
  const Event = require('../models/Event');
  const Booking = require('../models/Booking');
  try {
    const totalEvents = await Event.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const recentEvents = await Event.find().sort({ createdAt: -1 }).limit(5);
    const bookingPerEvent = await Booking.aggregate([
      {
        $group: {
          _id: '$eventId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event'
        }
      },
      {
        $unwind: '$event'
      },
      {
        $project: {
          eventName: '$event.title',
          count: 1
        }
      }
    ]);

    res.json({ totalEvents, totalBookings, recentEvents, bookingPerEvent });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard', error: err.message });
  }
});

module.exports = router;
