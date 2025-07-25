const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signAccessToken } = require('../helpers/jwtHelper');

// ✅ Register controller
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('❌ Registration failed:', err.message);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// ✅ Login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt:', email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signAccessToken(user);
    if (!token) {
      return res.status(500).json({ message: 'Failed to generate token' });
    }

    // ✅ Set token in response header for frontend access (optional)
    res.setHeader('Authorization', `Bearer ${token}`);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('❌ Login failed:', err.message);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
