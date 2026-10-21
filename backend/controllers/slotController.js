// backend/controllers/slotController.js
// Handles creating and viewing doctor appointment slots

const Slot = require('../models/Slot');
const Doctor = require('../models/Doctor');

/**
 * @desc    Get slots (filtered by doctorId, date, and/or status)
 * @route   GET /api/slots
 * @access  Private (All logged-in users: patient, doctor, admin)
 */
const getSlots = async (req, res, next) => {
  try {
    const { doctorId, date, status } = req.query;
    const filter = {};

    if (doctorId) {
      filter.doctor = doctorId;
    }

    if (date) {
      filter.date = date;
    }

    if (status) {
      filter.status = status;
    }

    const slots = await Slot.find(filter)
      .populate('doctor', 'name email specialty consultationFee')
      .sort({ date: 1, startTime: 1 });

    return res.status(200).json({
      success: true,
      count: slots.length,
      slots
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new time slot
 * @route   POST /api/slots
 * @access  Private (Doctor only)
 */
const createSlot = async (req, res, next) => {
  try {
    const { date, startTime, endTime } = req.body;

    // 1. Validate fields
    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date (YYYY-MM-DD), startTime (HH:mm), and endTime (HH:mm)'
      });
    }

    // 2. Find doctor profile belonging to the logged-in user
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found for this user account'
      });
    }

    // 3. Check for existing slot at the same time to prevent duplicate entry
    const existingSlot = await Slot.findOne({
      doctor: doctor._id,
      date,
      startTime
    });

    if (existingSlot) {
      return res.status(409).json({
        success: false,
        message: 'A slot for this date and start time already exists'
      });
    }

    // 4. Create slot
    const slot = await Slot.create({
      doctor: doctor._id,
      date,
      startTime,
      endTime,
      status: 'available'
    });

    return res.status(201).json({
      success: true,
      message: 'Time slot created successfully',
      slot
    });
  } catch (error) {
    // Check for MongoDB duplicate key error (code 11000)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Conflict: Slot already exists for this doctor, date, and start time'
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete an unbooked slot
 * @route   DELETE /api/slots/:id
 * @access  Private (Doctor only)
 */
const deleteSlot = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const slot = await Slot.findOne({ _id: req.params.id, doctor: doctor._id });
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found or does not belong to you'
      });
    }

    if (slot.status === 'booked') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a slot that is already booked'
      });
    }

    await Slot.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Slot deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSlots,
  createSlot,
  deleteSlot
};
