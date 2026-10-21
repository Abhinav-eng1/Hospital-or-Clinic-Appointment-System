// frontend/src/pages/DoctorsList.jsx
// Displays directory of all doctors with specialty filtering and quick booking buttons

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

const DoctorsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch doctors list from API with optional specialty filter
  const fetchDoctors = async (specialty = '') => {
    try {
      setLoading(true);
      setError('');
      const url = specialty ? `/doctors?specialty=${encodeURIComponent(specialty)}` : '/doctors';
      const response = await api.get(url);

      if (response.data.success) {
        setDoctors(response.data.doctors);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doctors list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(specialtyFilter);
  }, [specialtyFilter]);

  // Admin delete doctor handler
  const handleDeleteDoctor = async (doctorId, doctorName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${doctorName}?`);
    if (!confirmDelete) return;

    try {
      const response = await api.delete(`/doctors/${doctorId}`);
      if (response.data.success) {
        setSuccessMsg(`Doctor ${doctorName} has been deleted`);
        fetchDoctors(specialtyFilter);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete doctor');
    }
  };

  // Filter doctors locally by search term (doctor name or specialty)
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Extract unique specialties for the filter dropdown
  const specialties = ['All Specialties', 'Cardiology', 'Neurology', 'Pediatrics', 'Dermatology', 'Orthopedics', 'General Medicine'];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Medical Specialists Directory</h2>
          <p>Find qualified doctors and book your clinic appointment</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin')}
            className="btn btn-primary"
          >
            + Add New Doctor (Admin)
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Filter and Search Bar */}
      <div className="filter-card">
        <div className="filter-grid">
          <div className="form-group">
            <label htmlFor="search">Search by Name or Keyword</label>
            <input
              id="search"
              type="text"
              className="form-control"
              placeholder="e.g. Dr. House, Cardiology..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="specialty">Filter by Specialty</label>
            <select
              id="specialty"
              className="form-control"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value === 'All Specialties' ? '' : e.target.value)}
            >
              {specialties.map((spec) => (
                <option key={spec} value={spec === 'All Specialties' ? '' : spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading medical specialists...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👨‍⚕️</div>
          <h3>No doctors found</h3>
          <p>Try selecting a different specialty or clearing your search filter.</p>
        </div>
      ) : (
        <div className="doctors-grid">
          {filteredDoctors.map((doc) => (
            <div key={doc._id} className="doctor-card">
              <div className="doctor-card-header">
                <div className="doctor-avatar">
                  {doc.name.replace('Dr. ', '').charAt(0)}
                </div>
                <div>
                  <h3 className="doctor-name">{doc.name}</h3>
                  <span className="badge badge-specialty">{doc.specialty}</span>
                </div>
              </div>

              <div className="doctor-details">
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{doc.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Experience:</span>
                  <span className="detail-value">{doc.experience} Years</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Consultation Fee:</span>
                  <span className="detail-value fee-highlight">${doc.consultationFee}</span>
                </div>
              </div>

              <div className="doctor-card-actions">
                {user?.role === 'patient' && (
                  <button
                    onClick={() => navigate(`/book?doctorId=${doc._id}`)}
                    className="btn btn-primary btn-block"
                  >
                    📅 Book Appointment
                  </button>
                )}

                {user?.role === 'admin' && (
                  <div className="admin-actions-row">
                    <button
                      onClick={() => navigate(`/admin`)}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Edit Doctor
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doc._id, doc.name)}
                      className="btn btn-outline-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}

                {user?.role === 'doctor' && (
                  <p className="doctor-badge-note">Registered Practitioner</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
