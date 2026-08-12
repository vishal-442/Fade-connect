const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createBooking,
  getBookingById,
  getMyBookings,
  getSalonBookings,
  getTodayBookings,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking,
} = require('../controllers/bookingController');

const router = express.Router();

router.post('/', protect, authorize('customer'), createBooking);
router.get('/mine', protect, authorize('customer'), getMyBookings);
router.get('/salon', protect, authorize('owner'), getSalonBookings);
router.get('/salon/today', protect, authorize('owner'), getTodayBookings);
router.put('/:id/cancel', protect, authorize('customer'), cancelBooking);
router.put('/:id/reschedule', protect, authorize('customer'), rescheduleBooking);
router.put('/:id/status', protect, authorize('owner'), updateBookingStatus);
router.get('/:id', protect, getBookingById);

module.exports = router;
