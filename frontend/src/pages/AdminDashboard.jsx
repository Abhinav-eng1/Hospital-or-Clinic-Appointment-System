// frontend/src/pages/AdminDashboard.jsx
// Admin command center for system metrics and full doctor lifecycle management (create, edit, delete)

import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const AdminDashboard = () => {
  // Statistics state
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Doctor Creation / Editing Modal / Form state
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDoctorId, setEditDoctorId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: 'Cardiology',
    experience: 5,
    consultationFee: 100,
  });

  // Fetch admin stats and list of doctors
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch stats
      const statsRes = await api.get('/admin/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      // Fetch all doctors
      const docRes = await api.get('/doctors');
      if (docRes.data.success) {
        setDoctors(docRes.data.doctors);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open modal for new doctor
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditDoctorId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      specialty: 'Cardiology',
      experience: 5,
      consultationFee: 100,
    });
    setShowDoctorModal(true);
  };

  // Open modal for editing existing doctor
  const handleOpenEditModal = (doctor) => {
    setIsEditing(true);
    setEditDoctorId(doctor._id);
    setFormData({
      name: doctor.name,
      email: doctor.email,
      password: '', // Leave blank when editing
      specialty: doctor.specialty,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
    });
    setShowDoctorModal(true);
  };

  // Submit add or edit doctor
  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isEditing) {
        // Update existing doctor profile
        const updatePayload = {
          name: formData.name,
          specialty: formData.specialty,
          experience: Number(formData.experience),
          consultationFee: Number(formData.consultationFee),
        };

        const res = await api.put(`/doctors/${editDoctorId}`, updatePayload);
        if (res.data.success) {
          setSuccess(`Doctor ${formData.name} updated successfully`);
          setShowDoctorModal(false);
          fetchData();
        }
      } else {
        // Create new doctor profile and user account
        if (!formData.password || formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }

        const res = await api.post('/doctors', formData);
        if (res.data.success) {
          setSuccess(`Doctor ${formData.name} successfully registered`);
          setShowDoctorModal(false);
          fetchData();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save doctor details');
    }
  };

  // Delete doctor
  const handleDeleteDoctor = async (doctorId, doctorName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${doctorName}? This will remove their profile and login account.`
    );
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/doctors/${doctorId}`);
      if (res.data.success) {
        setSuccess(`Doctor ${doctorName} removed from system`);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete doctor');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Hospital Administrator Command Center</h2>
          <p>System metrics, doctor directory management, and appointments oversight</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          + Add New Doctor
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* METRICS & STATISTICS CARDS */}
      {stats && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">👨‍⚕️</div>
            <div className="metric-content">
              <span className="metric-label">Total Doctors</span>
              <span className="metric-value">{stats.totalDoctors}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">👥</div>
            <div className="metric-content">
              <span className="metric-label">Registered Patients</span>
              <span className="metric-value">{stats.totalPatients}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">📑</div>
            <div className="metric-content">
              <span className="metric-label">Total Appointments</span>
              <span className="metric-value">{stats.totalAppointments}</span>
            </div>
          </div>

          <div className="metric-card highlight">
            <div className="metric-content-status">
              <span className="metric-label">Status Breakdown</span>
              <div className="status-counts-row">
                <span className="status-pill status-booked">
                  Booked: {stats.statusCounts?.booked || 0}
                </span>
                <span className="status-pill status-completed">
                  Completed: {stats.statusCounts?.completed || 0}
                </span>
                <span className="status-pill status-cancelled">
                  Cancelled: {stats.statusCounts?.cancelled || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCTORS MANAGEMENT SECTION */}
      <div className="section-card">
        <div className="section-header">
          <h3>Doctor Staff Directory ({doctors.length})</h3>
          <button onClick={handleOpenAddModal} className="btn btn-outline-primary btn-sm">
            + Add Doctor
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading records...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="empty-state">
            <p>No doctors registered yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Email</th>
                  <th>Specialty</th>
                  <th>Experience</th>
                  <th>Fee</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc._id}>
                    <td className="font-semibold">{doc.name}</td>
                    <td>{doc.email}</td>
                    <td>
                      <span className="badge badge-specialty">{doc.specialty}</span>
                    </td>
                    <td>{doc.experience} Years</td>
                    <td>${doc.consultationFee}</td>
                    <td>
                      <div className="action-buttons-group">
                        <button
                          onClick={() => handleOpenEditModal(doc)}
                          className="btn btn-outline-primary btn-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doc._id, doc.name)}
                          className="btn btn-outline-danger btn-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECENT APPOINTMENTS OVERVIEW */}
      {stats?.recentAppointments && stats.recentAppointments.length > 0 && (
        <div className="section-card mt-6">
          <div className="section-header">
            <h3>Recent Appointments Log</h3>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAppointments.map((app) => (
                  <tr key={app._id}>
                    <td>{app.patient?.name || 'Patient'}</td>
                    <td>{app.doctor?.name || 'Doctor'}</td>
                    <td>{app.doctor?.specialty || 'General'}</td>
                    <td>{app.date} at {app.time}</td>
                    <td>
                      <span className={`status-badge status-${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOCTOR CREATE / EDIT MODAL */}
      {showDoctorModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{isEditing ? 'Edit Doctor Profile' : 'Register New Doctor'}</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowDoctorModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDoctorSubmit} className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Dr. John Watson"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. watson@hospital.com"
                  value={formData.email}
                  disabled={isEditing}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {!isEditing && (
                <div className="form-group">
                  <label>Initial Login Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!isEditing}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Specialty</label>
                <select
                  className="form-control"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  required
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group half">
                  <label>Consultation Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowDoctorModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Save Changes' : 'Create Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
