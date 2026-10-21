// frontend/src/components/Navbar.jsx
// Navigation header that dynamically adapts its links based on the authenticated user's role

import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Hospital Brand Logo & Title */}
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🏥</span>
          <span className="brand-text">CarePoint Clinic</span>
        </Link>

        {/* Dynamic Navigation Links Based on Role */}
        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              {/* PATIENT Navigation */}
              {user.role === 'patient' && (
                <>
                  <NavLink
                    to="/doctors"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Doctors
                  </NavLink>
                  <NavLink
                    to="/book"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Book Appointment
                  </NavLink>
                  <NavLink
                    to="/my-appointments"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    My Appointments
                  </NavLink>
                </>
              )}

              {/* DOCTOR Navigation */}
              {user.role === 'doctor' && (
                <>
                  <NavLink
                    to="/doctor"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Doctor Dashboard
                  </NavLink>
                  <NavLink
                    to="/doctors"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    All Doctors
                  </NavLink>
                </>
              )}

              {/* ADMIN Navigation */}
              {user.role === 'admin' && (
                <>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Admin Dashboard
                  </NavLink>
                  <NavLink
                    to="/doctors"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Manage Doctors
                  </NavLink>
                </>
              )}

              {/* User Profile Info & Logout */}
              <div className="user-profile-section">
                <div className="user-badge">
                  <span className="user-name">{user.name}</span>
                  <span className={`role-pill role-${user.role}`}>
                    {user.role.toUpperCase()}
                  </span>
                </div>
                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
                  Logout
                </button>
              </div>
            </>
          ) : (
            /* Logged-out Navigation */
            <div className="auth-links">
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="btn btn-primary btn-sm"
              >
                Register as Patient
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
