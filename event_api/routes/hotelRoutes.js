const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');

const Hotel = require('../models/Hotel');
const HotelBooking = require('../models/HotelBooking');
const {
  createHotel,
  updateHotel,
  deleteHotel,
} = require('../controllers/hotelController');

// ✅ Create hotel - Admin only
router.post('/create', verifyToken, isAdmin, createHotel);

// ✅ Update hotel - Admin only
router.put('/:id', verifyToken, isAdmin, updateHotel);

// ✅ Delete hotel - Admin only
router.delete('/:id', verifyToken, isAdmin, deleteHotel);

// ✅ Get all hotels
router.get('/', async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
  } catch (err) {
    console.error('❌ Fetch hotels error:', err);
    res.status(500).json({ message: 'Failed to fetch hotels', error: err.message });
  }
});

// ✅ Book a hotel
router.post('/book', verifyToken, async (req, res) => {
  try {
    const { hotelId, guests = 1 } = req.body;
    const userId = req.user?.userId;

    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const booking = await HotelBooking.create({
      user: userId,
      hotel: hotel._id,
      amount: hotel.charges || hotel.price || 0,
      guests,
    });

    res.status(200).json({ message: 'Hotel booked successfully', booking });
  } catch (err) {
    console.error('❌ Hotel booking error:', err);
    res.status(500).json({ message: 'Booking failed', error: err.message });
  }
});

module.exports = router;
