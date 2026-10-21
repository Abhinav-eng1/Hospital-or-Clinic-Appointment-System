// frontend/src/App.jsx
// Main application component configuring React Router, Auth Context, and Protected Routes

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorsList from './pages/DoctorsList';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Root redirect handler
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === 'doctor') {
    return <Navigate to="/doctor" replace />;
  }

  return <Navigate to="/doctors" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          {/* Header Navigation */}
          <Navbar />

          {/* Main Content Area */}
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes (All Authenticated Users) */}
              <Route
                path="/doctors"
                element={
                  <ProtectedRoute>
                    <DoctorsList />
                  </ProtectedRoute>
                }
              />

              {/* Patient Only Routes */}
              <Route
                path="/book"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <BookAppointment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-appointments"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <MyAppointments />
                  </ProtectedRoute>
                }
              />

              {/* Doctor Only Routes */}
              <Route
                path="/doctor"
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Only Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Root redirect & fallback */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
