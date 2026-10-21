// backend/controllers/adminController.js
// Handles analytics and summary statistics for the admin dashboard

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

/**
 * @desc    Get system statistics for Admin Dashboard
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
const getAdminStats = async (req, res, next) => {
  try {
    // 1. Total count of doctors
    const totalDoctors = await Doctor.countDocuments();

    // 2. Total count of registered patients
    const totalPatients = await User.countDocuments({ role: 'patient' });

    // 3. Total count of appointments
    const totalAppointments = await Appointment.countDocuments();

    // 4. Appointment counts categorized by status
    const bookedAppointments = await Appointment.countDocuments({ status: 'Booked' });
    const completedAppointments = await Appointment.countDocuments({ status: 'Completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'Cancelled' });

    // 5. Recent 5 appointments for quick overview on dashboard
    const recentAppointments = await Appointment.find()
      .populate('doctor', 'name specialty')
      .populate('patient', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalDoctors,
        totalPatients,
        totalAppointments,
        statusCounts: {
          booked: bookedAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments
        },
        recentAppointments
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats
};
