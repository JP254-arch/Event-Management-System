const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar
} = require('../controllers/userController');

const verifyToken = require('../middlewares/verifyToken');
const upload = require('../middlewares/uploadAvatar');
const { register, login } = require('../controllers/authController');


// Get logged-in user profile
router.get('/me', verifyToken, getProfile);

// Update username/email
router.put('/me', verifyToken, updateProfile);

// Change password
router.put('/me/change-password', verifyToken, changePassword);

// Upload avatar image
router.post('/me/avatar', verifyToken, upload, uploadAvatar);

// register and login
router.post('/register', register);
router.post('/login', login);

//admin
router.get('/admin-only', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  res.json({ message: 'Welcome Admin 👑' });
});

// ✅ Profile routes
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);


module.exports = router;
