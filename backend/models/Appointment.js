// backend/models/Appointment.js
// Mongoose schema for Appointments booked by patients with doctors

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Appointment must have a patient']
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Appointment must be with a doctor']
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: [true, 'Appointment must reference a slot']
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: [true, 'Appointment date is required']
    },
    time: {
      type: String, // 'HH:mm'
      required: [true, 'Appointment time is required']
    },
    status: {
      type: String,
      enum: ['Booked', 'Completed', 'Cancelled'],
      default: 'Booked'
    }
  },
  {
    timestamps: true
  }
);

// Safety net: Unique index on doctor + date + time for active (Booked) appointments
// This prevents double booking at the database level while allowing cancelled slots to be re-booked
appointmentSchema.index(
  { doctor: 1, date: 1, time: 1 },
  { unique: true, partialFilterExpression: { status: 'Booked' } }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
