const Hotel = require('../models/Hotel');

exports.createHotel = async (req, res) => {
  try {
    const { name, location, charges, image, description } = req.body;

    if (!name || !location || !charges || !image) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const parsedCharges = typeof charges === 'string'
      ? Number(charges.replace(/[^0-9.]/g, ''))
      : charges;

    if (isNaN(parsedCharges)) {
      return res.status(400).json({ message: 'Invalid charges value' });
    }

    const newHotel = new Hotel({
      name,
      location,
      charges: parsedCharges,
      imageUrl: image, // ✅ Save as imageUrl in DB
      description,
    });

    const savedHotel = await newHotel.save();
    res.status(201).json(savedHotel);
  } catch (err) {
    console.error('❌ Creating hotel failed:', err);
    res.status(500).json({ message: 'Creating hotel failed', error: err.message });
  }
};

exports.updateHotel = async (req, res) => {
  try {
    if (req.body.image) {
      req.body.imageUrl = req.body.image; // ✅ Normalize field
      delete req.body.image;
    }

    const updated = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Hotel not found' });
    res.status(200).json(updated);
  } catch (err) {
    console.error('❌ Updating hotel failed:', err);
    res.status(500).json({ message: 'Updating hotel failed', error: err.message });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    const deleted = await Hotel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Hotel not found' });
    res.status(200).json({ message: 'Hotel deleted successfully' });
  } catch (err) {
    console.error('❌ Deleting hotel failed:', err);
    res.status(500).json({ message: 'Deleting hotel failed', error: err.message });
  }
};
