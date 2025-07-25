// 📁 routes/flightRoutes.js
const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/verifyToken');
const isAdmin = require('../middlewares/isAdmin');

const {
  createFlight,
  getAllFlights,
  getFlightById,
  updateFlight,
  deleteFlight,
} = require('../controllers/flightController');

// ✅ Admin-only routes
router.post('/add', verifyToken, isAdmin, createFlight);         // 🔄 updated from /create → /add
router.put('/:id', verifyToken, isAdmin, updateFlight);
router.delete('/:id', verifyToken, isAdmin, deleteFlight);

// ✅ Public routes
router.get('/', getAllFlights);
router.get('/:id', getFlightById);

module.exports = router;
