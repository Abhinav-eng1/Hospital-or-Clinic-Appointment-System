// frontend/src/pages/MyAppointments.jsx
// Patient appointments page displaying upcoming, completed, and cancelled bookings with cancel action

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

const MyAppointments = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'Booked', 'Completed', 'Cancelled'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Fetch patient's appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/appointments/my');
      if (response.data.success) {
        setAppointments(response.data.appointments);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Cancel appointment handler
  const handleCancelAppointment = async (appointmentId) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this appointment? Your time slot will be reopened for other patients.'
    );
    if (!confirmCancel) return;

    try {
      const response = await api.put(`/appointments/${appointmentId}/cancel`);
      if (response.data.success) {
        setActionSuccess('Appointment successfully cancelled and slot was released');
        fetchAppointments();
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel appointment');
    }
  };

  // Filter appointments according to selected tab
  const filteredAppointments = appointments.filter((app) => {
    if (filterTab === 'all') return true;
    return app.status === filterTab;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>My Appointments</h2>
          <p>Review your scheduled consultations and past medical visits</p>
        </div>
        <button onClick={() => navigate('/book')} className="btn btn-primary">
          + Book New Appointment
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}

      {/* Filter Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${filterTab === 'all' ? 'active' : ''}`}
          onClick={() => setFilterTab('all')}
        >
          All ({appointments.length})
        </button>
        <button
          className={`tab-btn ${filterTab === 'Booked' ? 'active' : ''}`}
          onClick={() => setFilterTab('Booked')}
        >
          Upcoming ({appointments.filter((a) => a.status === 'Booked').length})
        </button>
        <button
          className={`tab-btn ${filterTab === 'Completed' ? 'active' : ''}`}
          onClick={() => setFilterTab('Completed')}
        >
          Completed ({appointments.filter((a) => a.status === 'Completed').length})
        </button>
        <button
          className={`tab-btn ${filterTab === 'Cancelled' ? 'active' : ''}`}
          onClick={() => setFilterTab('Cancelled')}
        >
          Cancelled ({appointments.filter((a) => a.status === 'Cancelled').length})
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No appointments found</h3>
          <p>You do not have any appointments under this status.</p>
          <button onClick={() => navigate('/book')} className="btn btn-outline-primary btn-sm">
            Book an Appointment Now
          </button>
        </div>
      ) : (
        <div className="appointments-grid">
          {filteredAppointments.map((app) => (
            <div key={app._id} className="appointment-card">
              <div className="appointment-card-header">
                <div>
                  <h3 className="appointment-doctor-name">{app.doctor?.name || 'Doctor'}</h3>
                  <span className="badge badge-specialty">{app.doctor?.specialty || 'General'}</span>
                </div>
                <span className={`status-badge status-${app.status.toLowerCase()}`}>
                  {app.status}
                </span>
              </div>

              <div className="appointment-body">
                <div className="appointment-info-row">
                  <span className="info-icon">📆</span>
                  <span className="info-text">
                    <strong>Date:</strong> {app.date}
                  </span>
                </div>
                <div className="appointment-info-row">
                  <span className="info-icon">⏰</span>
                  <span className="info-text">
                    <strong>Time:</strong> {app.time}
                  </span>
                </div>
                <div className="appointment-info-row">
                  <span className="info-icon">💵</span>
                  <span className="info-text">
                    <strong>Consultation Fee:</strong> ${app.doctor?.consultationFee || 0}
                  </span>
                </div>
                <div className="appointment-info-row">
                  <span className="info-icon">✉️</span>
                  <span className="info-text">
                    <strong>Doctor Email:</strong> {app.doctor?.email || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="appointment-footer">
                {app.status === 'Booked' && (
                  <button
                    onClick={() => handleCancelAppointment(app._id)}
                    className="btn btn-outline-danger btn-block btn-sm"
                  >
                    Cancel Appointment
                  </button>
                )}
                {app.status === 'Completed' && (
                  <span className="text-muted text-sm">Visit finished & marked completed</span>
                )}
                {app.status === 'Cancelled' && (
                  <span className="text-muted text-sm">Cancelled (slot has been reopened)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
