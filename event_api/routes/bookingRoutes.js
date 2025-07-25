const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// ✅ Middlewares
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');

// ✅ Models
const Booking = require('../models/Booking');
const generateTicket = require('../utils/generateTicket');

// ✅ Controller functions
const {
  bookItem,
  getMyBookings,
  getSingleBooking,
  cancelBooking,
  getAllBookings,
} = require('../controllers/bookingController');

// =======================
// 🧾 USER ROUTES
// =======================

// 📦 Book a ticket (event/flight/hotel)
router.post('/book', verifyToken, bookItem);

// 📋 Get all bookings for the logged-in user
router.get('/my-bookings', verifyToken, getMyBookings);

// =======================
// 🛠️ ADMIN ROUTES
// =======================

// 📋 View all bookings
router.get('/all', verifyToken, isAdmin, getAllBookings);

// =======================
// 🎟️ USER ROUTES CONT.
// =======================

// 📋 Get a specific booking by ID
router.get('/:bookingId', verifyToken, getSingleBooking);

// ❌ Cancel a booking
router.delete('/:bookingId', verifyToken, cancelBooking);

// =======================
// 🎟️ Generate PDF Ticket Route
// =======================
router.get('/generate-ticket/:bookingId', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('user')
      .populate('event');

    if (!booking || booking.type !== 'event') {
      return res.status(404).json({ message: 'Event booking not found.' });
    }

    const user = booking.user;
    const event = booking.event;

    const pdfBuffer = await generateTicket(booking, user, event);

    const ticketsFolder = path.join(__dirname, '../tickets');
    if (!fs.existsSync(ticketsFolder)) {
      fs.mkdirSync(ticketsFolder);
    }

    const filePath = path.join(ticketsFolder, `ticket_${booking._id}.pdf`);
    fs.writeFileSync(filePath, pdfBuffer);

    booking.ticketUrl = `/tickets/ticket_${booking._id}.pdf`;
    await booking.save();

    res.json({ message: 'Ticket generated successfully', url: `${req.protocol}://${req.get('host')}${booking.ticketUrl}` });
  } catch (err) {
    console.error('❌ Failed to generate ticket:', err);
    res.status(500).json({ message: 'Failed to generate ticket' });
  }
});

module.exports = router;
