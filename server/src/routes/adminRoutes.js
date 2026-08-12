const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getSummary,
  listUsers,
  toggleBlockUser,
  listSalons,
  setSalonStatus,
  listReviews,
  toggleHideReview,
  listPayments,
  createCoupon,
  listCoupons,
  toggleCoupon,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/summary', getSummary);

router.get('/users', listUsers);
router.put('/users/:id/block', toggleBlockUser);

router.get('/salons', listSalons);
router.put('/salons/:id/status', setSalonStatus);

router.get('/reviews', listReviews);
router.put('/reviews/:id/hide', toggleHideReview);

router.get('/payments', listPayments);

router.get('/coupons', listCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id/toggle', toggleCoupon);

module.exports = router;
