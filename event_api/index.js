// 📁 index.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// ✅ Ensure Mongo URI is set
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI not defined in .env');
  process.exit(1);
}

// ✅ Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// ✅ Serve static files
app.use('/tickets', express.static(path.join(__dirname, 'tickets')));
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads/avatars')));

// ✅ Route imports
const authRoutes = require('./routes/authRoutes');           // Login/Register
const eventRoutes = require('./routes/eventRoutes');         // Public & admin event routes
const userRoutes = require('./routes/userRoutes');           // User profile & avatar
const adminRoutes = require('./routes/adminRoutes');         // Admin panel routes
const bookingRoutes = require('./routes/bookingRoutes');     // Bookings (event/flight/hotel)
const stripeRoutes = require('./routes/stripeRoutes');       // Stripe payments
const hotelRoutes = require('./routes/hotelRoutes1');        // Hotel management
const flightRoutes = require('./routes/flightRoutes');       // Flight management

// ✅ Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/flights', flightRoutes);

// ✅ 404 for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
