// backend/middleware/authMiddleware.js
// Middleware to verify the incoming JSON Web Token (JWT) on protected routes

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protects routes by checking for a valid Bearer token in the Authorization header
 */
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and begins with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Format is: "Bearer <token>", so split by space and get token at index 1
      token = req.headers.authorization.split(' ')[1];

      // Verify token signature against JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID contained in token payload (excluding password field)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists'
        });
      }

      // Proceed to the next middleware or controller
      return next();
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token is invalid or expired'
      });
    }
  }

  // If no token was found in the header
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

module.exports = { protect };
