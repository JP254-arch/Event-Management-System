const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['event', 'flight', 'hotel'],
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight'
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel'
  },
  amount: {
    type: Number,
    required: true
  },
  ticketUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  },
  // ✅ New field: explicitly store booking date (check-in date for hotel, event date for event, departure date for flight)
  date: {
    type: Date,
  },
  bookedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
