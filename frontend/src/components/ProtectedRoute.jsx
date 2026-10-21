// frontend/src/components/ProtectedRoute.jsx
// Guards routes so only authenticated users with the correct role can access them

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard component
 * 
 * @param {Array} allowedRoles - Optional list of roles permitted to view the child route (e.g., ['patient'])
 * @param {ReactNode} children - The protected page component
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  // If initial authentication check is still pending, display a simple loading indicator
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // 1. If not authenticated, redirect to login page while preserving attempt location
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If route specifies allowed roles and user's role is not included, redirect to role-specific dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === 'doctor') {
      return <Navigate to="/doctor" replace />;
    }
    return <Navigate to="/doctors" replace />;
  }

  // Authorized: render the requested component
  return children;
};

export default ProtectedRoute;
