// backend/controllers/doctorController.js
// Handles CRUD operations for Doctor profiles

const Doctor = require('../models/Doctor');
const User = require('../models/User');

/**
 * @desc    Get all doctors (supports filter by specialty)
 * @route   GET /api/doctors
 * @access  Private (All logged-in users: patient, doctor, admin)
 */
const getDoctors = async (req, res, next) => {
  try {
    const { specialty } = req.query;
    const filter = {};

    // If specialty query parameter is provided, perform case-insensitive regex search
    if (specialty && specialty.trim() !== '') {
      filter.specialty = { $regex: specialty.trim(), $options: 'i' };
    }

    const doctors = await Doctor.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single doctor by ID
 * @route   GET /api/doctors/:id
 * @access  Private (All logged-in users)
 */
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email role');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    return res.status(200).json({
      success: true,
      doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new doctor (creates User account + Doctor profile)
 * @route   POST /api/doctors
 * @access  Private (Admin only)
 */
const createDoctor = async (req, res, next) => {
  try {
    const { name, email, password, specialty, experience, consultationFee } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password || !specialty || experience === undefined || consultationFee === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all doctor details: name, email, password, specialty, experience, consultationFee'
      });
    }

    // 2. Check if user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // 3. Create User account with role 'doctor'
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'doctor'
    });

    // 4. Create Doctor profile linked to User account
    const doctor = await Doctor.create({
      user: newUser._id,
      name,
      email: email.toLowerCase(),
      specialty,
      experience: Number(experience),
      consultationFee: Number(consultationFee)
    });

    return res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update doctor profile
 * @route   PUT /api/doctors/:id
 * @access  Private (Admin only)
 */
const updateDoctor = async (req, res, next) => {
  try {
    const { name, specialty, experience, consultationFee } = req.body;

    let doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Update doctor profile fields
    if (name) doctor.name = name;
    if (specialty) doctor.specialty = specialty;
    if (experience !== undefined) doctor.experience = Number(experience);
    if (consultationFee !== undefined) doctor.consultationFee = Number(consultationFee);

    await doctor.save();

    // Also sync the name on the corresponding User document
    if (name) {
      await User.findByIdAndUpdate(doctor.user, { name });
    }

    return res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete doctor profile and linked User account
 * @route   DELETE /api/doctors/:id
 * @access  Private (Admin only)
 */
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Delete linked User document
    await User.findByIdAndDelete(doctor.user);

    // Delete Doctor profile
    await Doctor.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
};
