// backend/server.js
// Main entry point for the Hospital and Clinic Appointment System backend API

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
const { connectDB, getDbError } = require('./config/db');
connectDB();

// Initialize Express app
const app = express();

// Middlewares
// Dynamic CORS handling to safely support credentials without wildcard conflicts
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server) and any web origin
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// Health check endpoint with diagnostic information
app.get('/api/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateCode = mongoose.connection.readyState;
  res.status(200).json({
    success: true,
    message: 'Hospital Appointment System API is up and running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStates[stateCode] || 'unknown',
      readyState: stateCode,
      host: mongoose.connection.host || null,
      error: getDbError()
    },
    config: {
      hasMongoUri: Boolean(process.env.MONGO_URI),
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
      port: process.env.PORT || 5000
    }
  });
});

// Retry DB connection endpoint if needed
app.post('/api/health/reconnect', async (req, res) => {
  await connectDB();
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateCode = mongoose.connection.readyState;
  res.status(200).json({
    status: dbStates[stateCode] || 'unknown',
    readyState: stateCode,
    host: mongoose.connection.host || null,
    error: getDbError()
  });
});

// Mount modular routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/slots', require('./routes/slotRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Central Error Handling Middlewares
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');
app.use(notFoundHandler);
app.use(errorHandler);

// Start server listening on 0.0.0.0 for cloud host compatibility (Render, Docker, etc.)
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
