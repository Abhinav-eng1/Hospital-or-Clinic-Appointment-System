// backend/middleware/errorMiddleware.js
// Central error handling middlewares for Express

/**
 * Middleware for routes that are not found
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Central Error Handler Middleware
 * Catches all errors passed with next(error) and sends clean JSON response
 */
const errorHandler = (err, req, res, next) => {
  // If status code is 200, default to 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    // Include stack trace only in development mode to assist beginner debugging
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
