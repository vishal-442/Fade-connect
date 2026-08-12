const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  listMyBookings,
  listOwnerBookings,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/me', protect, listMyBookings);
router.get('/owner', protect, authorize('owner', 'admin'), listOwnerBookings);

router.post(
  '/',
  protect,
  [
    body('salon').isMongoId(),
    body('service').isMongoId(),
    body('worker').isMongoId(),
    body('appointmentTime').isISO8601(),
    body('notes').optional().trim().isLength({ max: 300 })
  ],
  validateRequest,
  createBooking
);

router.patch(
  '/:id/status',
  protect,
  [body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled'])],
  validateRequest,
  updateBookingStatus
);

module.exports = router;
