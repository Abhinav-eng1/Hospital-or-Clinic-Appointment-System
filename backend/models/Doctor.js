// backend/models/Doctor.js
// Mongoose schema for Doctor profiles

const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    // Reference to the User account for authentication
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Please provide doctor name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide doctor email'],
      lowercase: true,
      trim: true
    },
    specialty: {
      type: String,
      required: [true, 'Please provide specialty (e.g. Cardiology, Neurology)'],
      trim: true
    },
    experience: {
      type: Number,
      required: [true, 'Please provide years of experience'],
      min: [0, 'Experience cannot be negative']
    },
    consultationFee: {
      type: Number,
      required: [true, 'Please provide consultation fee'],
      min: [0, 'Consultation fee cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
