// 📁 routes/hotelRoutes1.js
const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');

const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking'); // Unified booking model

const {
  createHotel,
  updateHotel,
  deleteHotel,
} = require('../controllers/hotelController');

// ✅ Admin-only routes
router.post('/add', verifyToken, isAdmin, createHotel);         // 🔄 updated from /create → /add
router.put('/update/:id', verifyToken, isAdmin, updateHotel);
router.delete('/delete/:id', verifyToken, isAdmin, deleteHotel);

// ✅ Public: fetch all hotels
router.get('/', async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
  } catch (err) {
    console.error('❌ Fetch hotels error:', err);
    res.status(500).json({ message: 'Failed to fetch hotels', error: err.message });
  }
});

// ✅ Book hotel (saved in unified Booking model)
router.post('/book', verifyToken, async (req, res) => {
  try {
    const { hotelId, guests = 1 } = req.body;
    const userId = req.user?.userId;

    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const raw = hotel.charges || hotel.price || 0;
    const amount = typeof raw === 'string'
      ? Number(raw.replace(/[^0-9.]/g, ''))
      : raw;

    if (isNaN(amount)) {
      return res.status(400).json({ message: 'Invalid hotel price format.' });
    }

    const exists = await Booking.findOne({ user: userId, hotel: hotel._id });
    if (exists) {
      return res.status(400).json({ message: 'You have already booked this hotel.' });
    }

    const booking = await Booking.create({
      user: userId,
      hotel: hotel._id,
      amount,
      guests,
      type: 'hotel',
      status: 'confirmed'
    });

    res.status(200).json({ message: 'Hotel booked successfully', booking });
  } catch (err) {
    console.error('❌ Hotel booking error:', err);
    res.status(500).json({ message: 'Booking failed', error: err.message });
  }
});

module.exports = router;
