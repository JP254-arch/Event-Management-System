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
  charges: {
    type: Number,
    required: true,
  },
  flightNumber: {
    type: String,
  },
}, { timestamps: true });

// ✅ Fix OverwriteModelError by using cached model if it exists
module.exports = mongoose.models.Flight || mongoose.model('Flight', flightSchema);
