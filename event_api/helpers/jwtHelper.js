const jwt = require('jsonwebtoken');

// Sign a new access token for the user
const signAccessToken = (user) => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    console.error('❌ ACCESS_TOKEN_SECRET not defined in .env');
    return null;
  }

  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      isAdmin: user.role === 'admin'  // ✅ optional shortcut for admin checks
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1d' }
  );
};

// Verify a token and return the decoded user or null
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    return null;
  }
};

module.exports = {
  signAccessToken,
  verifyAccessToken
};
