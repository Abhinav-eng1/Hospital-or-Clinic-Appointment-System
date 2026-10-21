// frontend/src/pages/Login.jsx
// User login page with JWT authentication and one-click demo credentials for quick testing

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after successful login
  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success) {
        const { token, user } = response.data;
        login(token, user);

        // Redirect user based on their role (or previous intended route)
        if (from) {
          navigate(from, { replace: true });
        } else if (user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (user.role === 'doctor') {
          navigate('/doctor', { replace: true });
        } else {
          navigate('/doctors', { replace: true });
        }
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to fill in seeded demo accounts with 1 click
  const fillDemoCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🔐</div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your clinic appointments & dashboard</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="e.g. user@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="demo-credentials-box">
          <p className="demo-title">💡 Quick Demo Logins (Click to autofill):</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => fillDemoCredentials('patient@hospital.com', 'patientpassword123')}
            >
              Patient Demo
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => fillDemoCredentials('sarah.connor@hospital.com', 'doctorpassword123')}
            >
              Doctor Demo
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => fillDemoCredentials('admin@hospital.com', 'adminpassword123')}
            >
              Admin Demo
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Are you a new patient?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
