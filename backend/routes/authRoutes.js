// backend/routes/authRoutes.js
// Routes for user registration, authentication, and getting current user profile

const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
