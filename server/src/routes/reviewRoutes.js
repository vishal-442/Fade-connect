const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createReview, getSalonReviews, reportReview } = require('../controllers/reviewController');

const router = express.Router();

router.get('/salon/:salonId', getSalonReviews);
router.post('/', protect, authorize('customer'), createReview);
router.put('/:id/report', protect, reportReview);

module.exports = router;
