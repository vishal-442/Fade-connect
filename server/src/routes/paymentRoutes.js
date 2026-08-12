const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createOrder, verifyPayment, getMyPayments } = require('../controllers/paymentController');

const router = express.Router();

router.post('/order', protect, authorize('customer'), createOrder);
router.post('/verify', protect, authorize('customer'), verifyPayment);
router.get('/mine', protect, authorize('customer'), getMyPayments);

module.exports = router;
