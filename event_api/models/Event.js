// models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  datetime: { type: Date, required: true },
  price: { type: Number, required: true },
  category: { type: String },
  image: { type: String }, // ✅ Added image field (URL)
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
