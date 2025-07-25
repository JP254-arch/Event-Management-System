const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  date: Date,
  location: String,
  category: String,
  charges: Number,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// ✅ Prevent OverwriteModelError during hot reload or re-import
module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);
