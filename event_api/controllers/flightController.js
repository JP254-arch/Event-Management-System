const Flight = require('../models/Flight');

exports.createFlight = async (req, res) => {
  try {
    const {
      airline, from, to, departureTime,
      arrivalTime, charges, image, description
    } = req.body;

    if (!airline || !from || !to || !departureTime || !arrivalTime || !charges) {
      return res.status(400).json({ message: 'Missing required flight fields' });
    }

    const parsedCharges = typeof charges === 'string'
      ? Number(charges.replace(/[^0-9.]/g, ''))
      : charges;

    if (isNaN(parsedCharges)) {
      return res.status(400).json({ message: 'Invalid charges format' });
    }

    const newFlight = new Flight({
      airline,
      from,
      to,
      departureTime,
      arrivalTime,
      charges: parsedCharges,
      image,
      description
    });

    const savedFlight = await newFlight.save();
    res.status(201).json(savedFlight);
  } catch (err) {
    console.error('❌ Creating flight failed:', err);
    res.status(500).json({ message: 'Creating flight failed', error: err.message });
  }
};

exports.getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.find();
    res.status(200).json(flights);
  } catch (err) {
    console.error('❌ Fetching flights failed:', err);
    res.status(500).json({ message: 'Fetching flights failed', error: err.message });
  }
};

exports.getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    res.status(200).json(flight);
  } catch (err) {
    console.error('❌ Fetching flight failed:', err);
    res.status(500).json({ message: 'Fetching flight failed', error: err.message });
  }
};

exports.updateFlight = async (req, res) => {
  try {
    const updated = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Flight not found' });
    res.status(200).json(updated);
  } catch (err) {
    console.error('❌ Updating flight failed:', err);
    res.status(500).json({ message: 'Updating flight failed', error: err.message });
  }
};

exports.deleteFlight = async (req, res) => {
  try {
    const deleted = await Flight.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Flight not found' });
    res.status(200).json({ message: 'Flight deleted successfully' });
  } catch (err) {
    console.error('❌ Deleting flight failed:', err);
    res.status(500).json({ message: 'Deleting flight failed', error: err.message });
  }
};
