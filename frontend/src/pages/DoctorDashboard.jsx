// frontend/src/pages/DoctorDashboard.jsx
// Doctor portal to manage availability slots and review/complete patient appointments

import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const DoctorDashboard = () => {
  // Navigation tabs: 'appointments' or 'slots'
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointmentFilter, setAppointmentFilter] = useState('today'); // 'today', 'upcoming', 'all'

  // Data states
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);

  // Slot creation form states
  const [slotDate, setSlotDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [slotStartTime, setSlotStartTime] = useState('09:00');
  const [slotEndTime, setSlotEndTime] = useState('09:30');

  // Status & feedback states
  const [loading, setLoading] = useState(true);
  const [slotSubmitting, setSlotSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Fetch doctor's data (appointments and their created slots)
  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch appointments assigned to this doctor
      const appRes = await api.get('/appointments/my');
      if (appRes.data.success) {
        setAppointments(appRes.data.appointments);
        // Grab doctor profile info from first appointment if available
        if (appRes.data.appointments.length > 0) {
          setDoctorProfile(appRes.data.appointments[0].doctor);
        }
      }

      // Fetch doctor's slots
      const slotRes = await api.get('/slots');
      if (slotRes.data.success) {
        setSlots(slotRes.data.slots);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doctor dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  // 2. Create new time slot
  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!slotDate || !slotStartTime || !slotEndTime) {
      setError('Please provide date, start time, and end time for the slot');
      return;
    }

    try {
      setSlotSubmitting(true);
      const res = await api.post('/slots', {
        date: slotDate,
        startTime: slotStartTime,
        endTime: slotEndTime,
      });

      if (res.data.success) {
        setSuccess('Availability slot created successfully!');
        fetchDoctorData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create time slot');
    } finally {
      setSlotSubmitting(false);
    }
  };

  // 3. Mark appointment as completed
  const handleCompleteAppointment = async (appointmentId) => {
    try {
      const res = await api.put(`/appointments/${appointmentId}/complete`);
      if (res.data.success) {
        setSuccess('Appointment marked as Completed');
        fetchDoctorData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not mark appointment as completed');
    }
  };

  // 4. Delete an unbooked slot
  const handleDeleteSlot = async (slotId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this open slot?');
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/slots/${slotId}`);
      if (res.data.success) {
        setSuccess('Slot removed successfully');
        fetchDoctorData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete slot');
    }
  };

  // Filter appointments for Today / Upcoming / All
  const todayDateStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter((app) => {
    if (appointmentFilter === 'today') {
      return app.date === todayDateStr;
    }
    if (appointmentFilter === 'upcoming') {
      return app.date >= todayDateStr && app.status === 'Booked';
    }
    return true; // 'all'
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Doctor Dashboard</h2>
          <p>Manage your consultation hours and track patient visits</p>
        </div>
        <div className="dashboard-stats-pill">
          <span>Active Bookings: <strong>{appointments.filter((a) => a.status === 'Booked').length}</strong></span>
          <span>Open Slots: <strong>{slots.filter((s) => s.status === 'available').length}</strong></span>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Main Tab Switcher */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          📋 Patient Appointments ({appointments.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'slots' ? 'active' : ''}`}
          onClick={() => setActiveTab('slots')}
        >
          ⏰ Manage Availability Slots ({slots.length})
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div>
          <div className="sub-filter-row">
            <span className="sub-filter-label">Filter View:</span>
            <button
              className={`pill-btn ${appointmentFilter === 'today' ? 'active' : ''}`}
              onClick={() => setAppointmentFilter('today')}
            >
              Today's Patients
            </button>
            <button
              className={`pill-btn ${appointmentFilter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setAppointmentFilter('upcoming')}
            >
              Upcoming Booked
            </button>
            <button
              className={`pill-btn ${appointmentFilter === 'all' ? 'active' : ''}`}
              onClick={() => setAppointmentFilter('all')}
            >
              All Appointments
            </button>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🩺</div>
              <h3>No appointments found for this filter</h3>
              <p>Appointments booked by patients will appear here.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Patient Email</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((app) => (
                    <tr key={app._id}>
                      <td className="font-semibold">{app.patient?.name || 'Unknown Patient'}</td>
                      <td>{app.patient?.email || 'N/A'}</td>
                      <td>{app.date}</td>
                      <td>{app.time}</td>
                      <td>
                        <span className={`status-badge status-${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        {app.status === 'Booked' ? (
                          <button
                            onClick={() => handleCompleteAppointment(app._id)}
                            className="btn btn-success btn-sm"
                          >
                            ✓ Mark Completed
                          </button>
                        ) : (
                          <span className="text-muted text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANAGE SLOTS */}
      {activeTab === 'slots' && (
        <div className="doctor-slots-section">
          {/* Create New Slot Card */}
          <div className="card slot-creation-card">
            <h3>+ Create Available Time Slot</h3>
            <p className="card-subtitle">
              Add dates and consultation hours so patients can book appointments with you.
            </p>
            <form onSubmit={handleCreateSlot} className="slot-creation-form">
              <div className="form-group">
                <label htmlFor="slotDate">Date</label>
                <input
                  id="slotDate"
                  type="date"
                  className="form-control"
                  value={slotDate}
                  min={todayDateStr}
                  onChange={(e) => setSlotDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="slotStartTime">Start Time</label>
                <input
                  id="slotStartTime"
                  type="time"
                  className="form-control"
                  value={slotStartTime}
                  onChange={(e) => setSlotStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="slotEndTime">End Time</label>
                <input
                  id="slotEndTime"
                  type="time"
                  className="form-control"
                  value={slotEndTime}
                  onChange={(e) => setSlotEndTime(e.target.value)}
                  required
                />
              </div>

              <div className="slot-form-btn-container">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={slotSubmitting}
                >
                  {slotSubmitting ? 'Creating Slot...' : '+ Add Slot'}
                </button>
              </div>
            </form>
          </div>

          {/* List of Existing Slots */}
          <div className="existing-slots-header">
            <h3>Current Availability Slots</h3>
            <span className="text-muted text-sm">
              Note: Slots that have already been booked by patients cannot be deleted.
            </span>
          </div>

          {slots.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⌛</div>
              <h3>No slots created yet</h3>
              <p>Use the form above to add your available consultation hours.</p>
            </div>
          ) : (
            <div className="slots-grid">
              {slots.map((slot) => (
                <div key={slot._id} className={`slot-item-card ${slot.status}`}>
                  <div className="slot-item-date">{slot.date}</div>
                  <div className="slot-item-time">
                    {slot.startTime} - {slot.endTime}
                  </div>
                  <div className="slot-item-status">
                    <span className={`status-badge status-${slot.status}`}>
                      {slot.status === 'available' ? 'Open' : 'Booked'}
                    </span>
                  </div>
                  <div className="slot-item-actions">
                    {slot.status === 'available' && (
                      <button
                        onClick={() => handleDeleteSlot(slot._id)}
                        className="btn btn-outline-danger btn-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
