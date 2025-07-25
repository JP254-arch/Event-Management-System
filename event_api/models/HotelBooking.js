// 📁 models/HotelBooking.js
const mongoose = require('mongoose');

const hotelBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  guests: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('HotelBooking', hotelBookingSchema);
