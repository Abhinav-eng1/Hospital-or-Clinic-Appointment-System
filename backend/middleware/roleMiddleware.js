// backend/middleware/roleMiddleware.js
// Middleware to restrict access based on user role (patient, doctor, admin)

/**
 * Authorize specific roles
 * Usage example: authorize('admin') or authorize('doctor', 'admin')
 * 
 * @param  {...string} roles - List of allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user object was attached by protect middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please log in first'
      });
    }

    // Check if user's role matches any of the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Role '${req.user.role}' is not allowed to access this resource`
      });
    }

    next();
  };
};

module.exports = { authorize };
