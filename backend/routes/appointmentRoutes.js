// backend/routes/appointmentRoutes.js
// Routes for Appointment booking, listing, cancellation, and completion

const express = require('express');
const router = express.Router();

const {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  completeAppointment
} = require('../controllers/appointmentController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All appointment operations require login
router.use(protect);

// Book appointment (Patient only)
router.post('/', authorize('patient'), bookAppointment);

// View user's appointments (Patient sees own; Doctor sees assigned patients; Admin sees all)
router.get('/my', getMyAppointments);

// Patient cancels their appointment (frees slot)
router.put('/:id/cancel', authorize('patient'), cancelAppointment);

// Doctor marks their appointment as completed
router.put('/:id/complete', authorize('doctor'), completeAppointment);

module.exports = router;
