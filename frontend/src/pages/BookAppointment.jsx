// frontend/src/pages/BookAppointment.jsx
// Patient appointment booking flow with interactive doctor selection and live available slot picker

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const preselectedDoctorId = searchParams.get('doctorId') || '';

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(preselectedDoctorId);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Fetch available doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const response = await api.get('/doctors');
        if (response.data.success) {
          setDoctors(response.data.doctors);
        }
      } catch (err) {
        setError('Failed to load doctors list.');
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  // Set default date to today in YYYY-MM-DD
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  // 2. Fetch available slots whenever selectedDoctorId or selectedDate changes
  useEffect(() => {
    if (!selectedDoctorId) {
      setSlots([]);
      return;
    }

    const fetchDoctorSlots = async () => {
      try {
        setLoadingSlots(true);
        setError('');
        setSelectedSlotId('');

        // Query only 'available' slots for this doctor
        let url = `/slots?doctorId=${selectedDoctorId}&status=available`;
        if (selectedDate) {
          url += `&date=${selectedDate}`;
        }

        const response = await api.get(url);
        if (response.data.success) {
          setSlots(response.data.slots);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve availability slots');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchDoctorSlots();
  }, [selectedDoctorId, selectedDate]);

  // 3. Submit appointment booking
  const handleBooking = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedDoctorId) {
      setError('Please select a doctor');
      return;
    }

    if (!selectedSlotId) {
      setError('Please select an available time slot');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/appointments', {
        doctorId: selectedDoctorId,
        slotId: selectedSlotId
      });

      if (response.data.success) {
        setSuccess('Appointment successfully confirmed! Redirecting to your appointments...');
        setTimeout(() => {
          navigate('/my-appointments');
        }, 1800);
      }
    } catch (err) {
      // Handle 409 Conflict if slot was just taken by another patient
      if (err.response?.status === 409) {
        setError('Double booking alert: This time slot was just booked by another patient. Please choose another slot.');
        // Refresh slot list to reflect current state
        const refreshed = await api.get(`/slots?doctorId=${selectedDoctorId}&status=available&date=${selectedDate}`);
        if (refreshed.data.success) {
          setSlots(refreshed.data.slots);
          setSelectedSlotId('');
        }
      } else {
        setError(err.response?.data?.message || 'Could not complete appointment booking');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Find the selected doctor profile details for summary display
  const currentDoctor = doctors.find((d) => d._id === selectedDoctorId);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Book a Medical Consultation</h2>
          <p>Choose your doctor, select an available date, and lock in your appointment</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="booking-layout">
        {/* Booking Form Controls */}
        <div className="booking-card">
          <form onSubmit={handleBooking}>
            {/* Step 1: Doctor Selection */}
            <div className="form-group">
              <label htmlFor="doctorSelect">1. Choose Doctor</label>
              <select
                id="doctorSelect"
                className="form-control"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                disabled={loadingDoctors}
                required
              >
                <option value="">-- Select a Specialist --</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} ({doc.specialty}) — ${doc.consultationFee}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Date Selection */}
            <div className="form-group">
              <label htmlFor="datePicker">2. Choose Consultation Date</label>
              <input
                id="datePicker"
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Step 3: Slot Picker */}
            <div className="form-group">
              <label>3. Select Available Time Slot</label>
              {loadingSlots ? (
                <div className="slot-loading">Checking doctor availability...</div>
              ) : !selectedDoctorId ? (
                <p className="hint-text">Select a doctor above to inspect open time slots</p>
              ) : slots.length === 0 ? (
                <div className="alert alert-warning">
                  No free time slots available on this date. Please try another date or another doctor.
                </div>
              ) : (
                <div className="slot-pills-grid">
                  {slots.map((slot) => {
                    const isSelected = selectedSlotId === slot._id;
                    return (
                      <button
                        key={slot._id}
                        type="button"
                        className={`slot-pill ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedSlotId(slot._id)}
                      >
                        <span className="slot-time">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <span className="slot-status-indicator">Available</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={submitting || !selectedSlotId}
            >
              {submitting ? 'Confirming Appointment...' : 'Confirm Appointment Booking'}
            </button>
          </form>
        </div>

        {/* Booking Summary Sidebar */}
        <div className="summary-card">
          <h3>Appointment Summary</h3>
          <hr />
          {currentDoctor ? (
            <div className="summary-details">
              <div className="summary-row">
                <span className="summary-label">Doctor:</span>
                <span className="summary-value">{currentDoctor.name}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Specialty:</span>
                <span className="summary-value badge badge-specialty">{currentDoctor.specialty}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Experience:</span>
                <span className="summary-value">{currentDoctor.experience} Years</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Date:</span>
                <span className="summary-value">{selectedDate || 'Not selected'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Time:</span>
                <span className="summary-value">
                  {selectedSlotId
                    ? slots.find((s) => s._id === selectedSlotId)?.startTime || 'Selected'
                    : 'Not selected'}
                </span>
              </div>
              <div className="summary-row total-fee">
                <span className="summary-label">Consultation Fee:</span>
                <span className="summary-value fee-highlight">${currentDoctor.consultationFee}</span>
              </div>
            </div>
          ) : (
            <p className="hint-text">Select a doctor to view appointment pricing and details.</p>
          )}

          <div className="policy-note">
            🛡️ <strong>Instant Confirmation & Easy Cancellation:</strong> You can cancel your appointment anytime from your appointments dashboard to free up your slot.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
