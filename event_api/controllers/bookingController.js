const path = require('path');
const fs = require('fs');
const Booking = require('../models/Booking');
const Event = require('../models/eventModel');
const Flight = require('../models/Flight');
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const generateTicket = require('../utils/generateTicket');
const sendEmailWithTicket = require('../utils/emailSender');

// 🔁 Unified booking (event / flight / hotel)
const bookItem = async (req, res) => {
  try {
    const { type, itemId } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let item;
    let bookingData = {
      user: user._id,
      type,
      status: 'confirmed'
    };

    const sanitizeAmount = (raw) => {
      if (typeof raw === 'string') {
        const cleaned = Number(raw.replace(/[^0-9.]/g, ''));
        if (isNaN(cleaned)) throw new Error('Invalid amount value');
        return cleaned;
      }
      return raw;
    };

    switch (type) {
      case 'event':
        item = await Event.findById(itemId);
        if (!item) return res.status(404).json({ message: 'Event not found' });
        bookingData.event = item._id;
        bookingData.amount = sanitizeAmount(item.price);
        bookingData.date = item.date;
        break;
      case 'flight':
        item = await Flight.findById(itemId);
        if (!item) return res.status(404).json({ message: 'Flight not found' });
        bookingData.flight = item._id;
        bookingData.amount = sanitizeAmount(item.charges);
        bookingData.date = item.departureTime;
        break;
      case 'hotel':
        item = await Hotel.findById(itemId);
        if (!item) return res.status(404).json({ message: 'Hotel not found' });
        bookingData.hotel = item._id;
        bookingData.amount = sanitizeAmount(item.charges);
        bookingData.date = new Date();
        break;
      default:
        return res.status(400).json({ message: 'Invalid booking type' });
    }

    const exists = await Booking.findOne({ user: user._id, [type]: item._id });
    if (exists) return res.status(400).json({ message: `You already booked this ${type}` });

    const booking = await Booking.create(bookingData);

    const ticketBuffer = await generateTicket(booking, user, item);
    const fileName = `ticket_${booking._id}.pdf`;
    const ticketsFolder = path.join(__dirname, '../tickets');
    if (!fs.existsSync(ticketsFolder)) {
      fs.mkdirSync(ticketsFolder);
    }
    const absoluteFilePath = path.join(ticketsFolder, fileName);
    fs.writeFileSync(absoluteFilePath, ticketBuffer);

    const relativeTicketUrl = `/tickets/${fileName}`;
    booking.ticketUrl = relativeTicketUrl;
    await booking.save();

    await sendEmailWithTicket(
      user.email,
      `🎫 Your ${type} Ticket`,
      `Hello ${user.username},\n\nAttached is your ${type} booking ticket.`,
      ticketBuffer,
      fileName
    );

    res.status(200).json({
      message: 'Booking successful',
      booking: {
        _id: booking._id,
        type,
        [type]: item,
        status: booking.status,
        ticketUrl: `${req.protocol}://${req.get('host')}${relativeTicketUrl}`,
        amount: booking.amount,
        date: booking.date
      }
    });
  } catch (err) {
    console.error('❌ Booking error:', err);
    res.status(500).json({ message: 'Booking failed', error: err.message });
  }
};

// 🔁 Unified "my bookings"
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId })
      .populate('event', 'title location date price')
      .populate('flight', 'airline from to departureTime price')
      .populate('hotel', 'name location charges')
      .sort({ createdAt: -1 });

    const result = bookings.map(b => ({
      _id: b._id,
      type: b.type,
      [b.type]: b[b.type],
      ticketUrl: `${req.protocol}://${req.get('host')}${b.ticketUrl}`,
      status: b.status,
      amount: b.amount,
      date: b.date
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error('❌ Fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch bookings.', error: err.message });
  }
};

// 🔍 Single booking (used for tickets)
const getSingleBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('user', 'username email')
      .populate('event', 'title location date price')
      .populate('flight', 'airline from to departureTime price')
      .populate('hotel', 'name location charges');

    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.user._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.status(200).json({
      _id: booking._id,
      type: booking.type,
      user: booking.user,
      event: booking.event,
      flight: booking.flight,
      hotel: booking.hotel,
      ticketUrl: `${req.protocol}://${req.get('host')}${booking.ticketUrl}`,
      status: booking.status,
      amount: booking.amount,
      date: booking.date,
    });
  } catch (err) {
    console.error('❌ Fetch single booking error:', err);
    res.status(500).json({ message: 'Failed to fetch booking.', error: err.message });
  }
};

// 🗑 Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await booking.deleteOne();
    res.status(200).json({ message: 'Booking cancelled successfully.' });
  } catch (err) {
    console.error('❌ Cancel error:', err);
    res.status(500).json({ message: 'Failed to cancel booking.', error: err.message });
  }
};

// 🔐 Admin - get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'username email')
      .populate('event', 'title location date price')
      .populate('flight', 'airline from to departureTime price')
      .populate('hotel', 'name location charges')
      .sort({ createdAt: -1 });

    const result = bookings.map(b => ({
      _id: b._id,
      user: b.user,
      type: b.type,
      [b.type]: b[b.type],
      ticketUrl: `${req.protocol}://${req.get('host')}${b.ticketUrl}`,
      status: b.status,
      amount: b.amount,
      date: b.date,
      createdAt: b.createdAt
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error('❌ Admin fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch all bookings.', error: err.message });
  }
};

module.exports = {
  bookItem,
  getMyBookings,
  getSingleBooking,
  cancelBooking,
  getAllBookings
};
