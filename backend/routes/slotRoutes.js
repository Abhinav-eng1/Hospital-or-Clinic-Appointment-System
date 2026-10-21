// backend/routes/slotRoutes.js
// Routes for Doctor time slots

const express = require('express');
const router = express.Router();

const {
  getSlots,
  createSlot,
  deleteSlot
} = require('../controllers/slotController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All slot routes require authentication
router.use(protect);

// Anyone logged in can view slots; only doctors can create slots
router.route('/')
  .get(getSlots)
  .post(authorize('doctor'), createSlot);

router.route('/:id')
  .delete(authorize('doctor'), deleteSlot);

module.exports = router;
