// backend/controllers/appointmentController.js
// Handles booking, viewing, cancelling, and completing appointments

const Appointment = require('../models/Appointment');
const Slot = require('../models/Slot');
const Doctor = require('../models/Doctor');

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient only)
 */
const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, slotId } = req.body;

    // 1. Validate inputs
    if (!doctorId || !slotId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both doctorId and slotId'
      });
    }

    // 2. Verify that doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // 3. Atomically check that the slot is available and claim it (prevents race condition)
    const claimedSlot = await Slot.findOneAndUpdate(
      { _id: slotId, doctor: doctorId, status: 'available' },
      { status: 'booked' },
      { new: true }
    );

    // If slot is not available or already booked, return 409 Conflict
    if (!claimedSlot) {
      return res.status(409).json({
        success: false,
        message: 'Conflict: This slot is already booked or no longer available'
      });
    }

    // 4. Create the appointment record
    try {
      const appointment = await Appointment.create({
        patient: req.user._id,
        doctor: doctorId,
        slot: slotId,
        date: claimedSlot.date,
        time: claimedSlot.startTime,
        status: 'Booked'
      });

      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate('doctor', 'name email specialty consultationFee')
        .populate('patient', 'name email')
        .populate('slot');

      return res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        appointment: populatedAppointment
      });
    } catch (saveError) {
      // If safety net compound index triggers (error code 11000 duplicate key)
      // revert the slot status back to 'available'
      await Slot.findByIdAndUpdate(slotId, { status: 'available' });

      if (saveError.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Conflict: An active appointment already exists for this doctor at this date and time'
        });
      }
      throw saveError;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's appointments (Patient views own; Doctor views assigned patients)
 * @route   GET /api/appointments/my
 * @access  Private (Patient / Doctor / Admin)
 */
const getMyAppointments = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      // Patient sees only their appointments
      query = { patient: req.user._id };
    } else if (req.user.role === 'doctor') {
      // Find doctor profile linked to user account
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found for this account'
        });
      }
      query = { doctor: doctor._id };
    } else if (req.user.role === 'admin') {
      // Admin can see all appointments
      query = {};
    }

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name email specialty consultationFee')
      .populate('patient', 'name email')
      .populate('slot')
      .sort({ date: -1, time: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an appointment (Patient only, frees up slot)
 * @route   PUT /api/appointments/:id/cancel
 * @access  Private (Patient only)
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Ensure the appointment belongs to the logged-in patient
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only cancel your own appointments'
      });
    }

    if (appointment.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This appointment is already cancelled'
      });
    }

    if (appointment.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an appointment that has already been completed'
      });
    }

    // 1. Mark appointment as Cancelled
    appointment.status = 'Cancelled';
    await appointment.save();

    // 2. Free up the slot so other patients can book it
    if (appointment.slot) {
      await Slot.findByIdAndUpdate(appointment.slot, { status: 'available' });
    }

    return res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully and slot is now available',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark appointment as Completed (Doctor only)
 * @route   PUT /api/appointments/:id/complete
 * @access  Private (Doctor only)
 */
const completeAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Find doctor profile belonging to the logged in user
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Ensure appointment belongs to this doctor
    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only mark your own appointments as completed'
      });
    }

    if (appointment.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete a cancelled appointment'
      });
    }

    appointment.status = 'Completed';
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: 'Appointment marked as completed successfully',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  completeAppointment
};
