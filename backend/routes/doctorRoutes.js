// backend/routes/doctorRoutes.js
// Routes for Doctor operations

const express = require('express');
const router = express.Router();

const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All doctor routes require user to be logged in
router.use(protect);

// Everyone logged in can view doctor list; only admin can add doctors
router.route('/')
  .get(getDoctors)
  .post(authorize('admin'), createDoctor);

// Specific doctor routes
router.route('/:id')
  .get(getDoctorById)
  .put(authorize('admin'), updateDoctor)
  .delete(authorize('admin'), deleteDoctor);

module.exports = router;
