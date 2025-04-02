const jwt = require('jsonwebtoken');

// Function to create a secret token with enhanced security
const createSecretToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: '7d',  // Token expires in 7 days
      algorithm: 'HS256' // Use HMAC SHA256 algorithm
    }
  );
};

// Optional: Token verification utility
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

module.exports = { 
  createSecretToken, 
  verifyToken 
};