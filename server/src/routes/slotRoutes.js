const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { generateSlots, getAvailableSlots, clearSlotsForDate } = require('../controllers/slotController');

const router = express.Router();

router.get('/available', getAvailableSlots);
router.post('/generate', protect, authorize('owner'), generateSlots);
router.delete('/', protect, authorize('owner'), clearSlotsForDate);

module.exports = router;
