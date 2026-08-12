const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Salon = require('../models/Salon');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Coupon = require('../models/Coupon');

// @desc    Platform-wide summary numbers for the admin dashboard
// @route   GET /api/admin/summary
// @access  Private (admin)
const getSummary = asyncHandler(async (req, res) => {
  const [users, salons, pendingSalons, bookings, revenueAgg, reportedReviews] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Salon.countDocuments(),
    Salon.countDocuments({ status: 'pending' }),
    Booking.countDocuments(),
    Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Review.countDocuments({ isReported: true, isHidden: false }),
  ]);

  res.json({
    success: true,
    users,
    salons,
    pendingSalons,
    bookings,
    totalRevenue: revenueAgg[0]?.total || 0,
    reportedReviews,
  });
});

// @desc    List all users (paginated, filterable by role)
// @route   GET /api/admin/users
// @access  Private (admin)
const listUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// @desc    Block or unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Private (admin)
const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc    List all salons (paginated, filterable by status)
// @route   GET /api/admin/salons
// @access  Private (admin)
const listSalons = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const skip = (Number(page) - 1) * Number(limit);
  const [salons, total] = await Promise.all([
    Salon.find(filter).populate('owner', 'name email').sort('-createdAt').skip(skip).limit(Number(limit)),
    Salon.countDocuments(filter),
  ]);
  res.json({ success: true, salons, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// @desc    Approve, reject, or block a salon
// @route   PUT /api/admin/salons/:id/status
// @access  Private (admin)
const setSalonStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'blocked', 'pending'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }
  const salon = await Salon.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!salon) {
    res.status(404);
    throw new Error('Salon not found');
  }
  res.json({ success: true, salon });
});

// @desc    List reported/all reviews for moderation
// @route   GET /api/admin/reviews
// @access  Private (admin)
const listReviews = asyncHandler(async (req, res) => {
  const { reported } = req.query;
  const filter = reported === 'true' ? { isReported: true } : {};
  const reviews = await Review.find(filter)
    .populate('customer', 'name')
    .populate('salon', 'name')
    .sort('-createdAt');
  res.json({ success: true, reviews });
});

// @desc    Hide/unhide a review
// @route   PUT /api/admin/reviews/:id/hide
// @access  Private (admin)
const toggleHideReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  review.isHidden = !review.isHidden;
  await review.save();
  res.json({ success: true, review });
});

// @desc    List all payments (admin, paginated)
// @route   GET /api/admin/payments
// @access  Private (admin)
const listPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [payments, total] = await Promise.all([
    Payment.find().populate('customer', 'name email').populate('salon', 'name').sort('-createdAt').skip(skip).limit(Number(limit)),
    Payment.countDocuments(),
  ]);
  res.json({ success: true, payments, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// @desc    Create a coupon
// @route   POST /api/admin/coupons
// @access  Private (admin)
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

// @desc    List coupons
// @route   GET /api/admin/coupons
// @access  Private (admin)
const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json({ success: true, coupons });
});

// @desc    Toggle coupon active state
// @route   PUT /api/admin/coupons/:id/toggle
// @access  Private (admin)
const toggleCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  res.json({ success: true, coupon });
});

module.exports = {
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
};
