const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  airline: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  departureTime: {
    type: Date,
    required: true,
  },
  arrivalTime: {
    type: Date,
    required: true,
  },
  charges: {                           // ✅ renamed from price
    type: Number,
    required: true,
  },
  flightNumber: {
    type: String,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Flight || mongoose.model('Flight', flightSchema);
