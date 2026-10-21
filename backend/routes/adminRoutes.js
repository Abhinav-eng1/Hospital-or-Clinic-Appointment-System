// backend/routes/adminRoutes.js
// Routes for administrative statistics and oversight

const express = require('express');
const router = express.Router();

const { getAdminStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All admin routes require login and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);

module.exports = router;
