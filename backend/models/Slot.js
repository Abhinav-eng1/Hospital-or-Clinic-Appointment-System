// backend/models/Slot.js
// Mongoose schema for Doctor availability slots

const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Slot must be associated with a doctor']
    },
    date: {
      type: String, // Stored as 'YYYY-MM-DD' for simple comparisons
      required: [true, 'Please provide slot date (YYYY-MM-DD)'],
      trim: true
    },
    startTime: {
      type: String, // Stored as 'HH:mm', e.g. "09:00"
      required: [true, 'Please provide slot start time (e.g. 09:00)'],
      trim: true
    },
    endTime: {
      type: String, // Stored as 'HH:mm', e.g. "09:30"
      required: [true, 'Please provide slot end time (e.g. 09:30)'],
      trim: true
    },
    status: {
      type: String,
      enum: ['available', 'booked'],
      default: 'available'
    }
  },
  {
    timestamps: true
  }
);

// Safety index: A doctor cannot have duplicate slots on the same date and startTime
slotSchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true });

const Slot = mongoose.model('Slot', slotSchema);

module.exports = Slot;
