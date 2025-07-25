const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Hotel = require('../models/hotelModel');
const Flight = require('../models/flightModel');

// ✅ Admin Dashboard Summary
router.get('/dashboard', verifyToken, isAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();
    res.json({
      message: 'Welcome to the admin dashboard',
      stats: {
        users: userCount,
        events: eventCount
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard', error: err.message });
  }
});

// ✅ Get all users
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// ✅ Delete a user
router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

// ✅ Create an event
router.post('/create', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, description, location, datetime, price, category } = req.body;

    if (!title || !description || !location || !datetime || !price) {
      return res.status(400).json({ message: 'Missing required fields: title, description, location, date, price.' });
    }

    const event = await Event.create({ title, description, location, datetime, price, category });
    res.status(201).json({ message: 'Event added successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
});

// ✅ Get all events
router.get('/events', verifyToken, isAdmin, async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch events', error: err.message });
  }
});

// ✅ Delete an event
router.delete('/events/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete event', error: err.message });
  }
});

// ✅ Get all bookings
router.get('/bookings', verifyToken, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'email')
      .populate('eventId', 'title')
      .sort({ bookedAt: -1 });

    const formatted = bookings.map(b => ({
      _id: b._id,
      user: b.userId,
      event: b.eventId,
      bookedAt: b.bookedAt
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
});

// ✅ Delete a booking
router.delete('/bookings/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete booking', error: err.message });
  }
});

// ✅ Update event
router.put('/events/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event updated successfully', event: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update event', error: err.message });
  }
});

// ✅ Get all hotels
router.get('/hotels', verifyToken, isAdmin, async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch hotels', error: err.message });
  }
});

// ✅ Get all flights
router.get('/flights', verifyToken, isAdmin, async (req, res) => {
  try {
    const flights = await Flight.find();
    res.json(flights);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch flights', error: err.message });
  }
});

module.exports = router;
