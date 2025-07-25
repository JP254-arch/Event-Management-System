// controllers/eventController.js
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const sendEmail = require('../helpers/sendEmail');

// Create Event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, location, datetime, price, category, image } = req.body;

    if (!title || !description || !location || !datetime || !price || !image) {
      return res.status(400).json({ message: 'All fields including image are required' });
    }

    const newEvent = new Event({ title, description, location, datetime, price, category, image });
    await newEvent.save();

    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (err) {
    res.status(500).json({ message: 'Event creation failed', error: err.message });
  }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Event deletion failed', error: err.message });
  }
};

// Get All Events (Public)
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

// Filtered Events (Search / Filter)
exports.getFilteredEvents = async (req, res) => {
  try {
    const { search, minPrice, maxPrice, location, startDate, endDate, category } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (location) {
      filter.location = new RegExp(location, 'i');
    }

    if (category) {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.datetime = {};
      if (startDate) filter.datetime.$gte = new Date(startDate);
      if (endDate) filter.datetime.$lte = new Date(endDate);
    }

    const events = await Event.find(filter).sort({ datetime: 1 });
    res.json(events);

  } catch (err) {
    res.status(500).json({ message: 'Failed to filter events', error: err.message });
  }
};

// Get Event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching event' });
  }
};

// Book Event
exports.bookEvent = async (req, res) => {
  try {
    const { eventId, email, paymentStatus } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const booking = new Booking({
      user: req.user.userId,
      event: eventId,
      email,
      paymentStatus
    });
    await booking.save();

    // Generate Ticket PDF
    const doc = new PDFDocument();
    const filename = `ticket_${booking._id}.pdf`;
    const filepath = path.join(__dirname, `../tickets/${filename}`);
    doc.pipe(fs.createWriteStream(filepath));
    doc.fontSize(20).text('🎫 Event Ticket', { align: 'center' });
    doc.moveDown();
    doc.text(`Event: ${event.title}`);
    doc.text(`Location: ${event.location}`);
    doc.text(`Date: ${new Date(event.datetime).toDateString()}`);
    doc.text(`Price: KES ${event.price}`);
    doc.text(`Booked by: ${email}`);
    doc.end();

    // Send email
    const ticketUrl = `http://localhost:4000/tickets/${filename}`;
    await sendEmail(email, 'Your Event Ticket', `
      <p>Thank you for booking <strong>${event.title}</strong>!</p>
      <p>🎟️ Download your ticket: <a href="${ticketUrl}">Click Here</a></p>
    `);

    res.json({ message: 'Booking successful. Ticket sent to email.' });
  } catch (err) {
    res.status(500).json({ message: 'Booking failed', error: err.message });
  }
};
