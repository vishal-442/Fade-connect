const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Salon = require('../models/Salon');

const recalcSalonRating = async (salonId) => {
  const stats = await Review.aggregate([
    { $match: { salon: salonId, isHidden: false } },
    { $group: { _id: '$salon', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Salon.findByIdAndUpdate(salonId, { ratingAverage: Math.round(avg * 10) / 10, ratingCount: count });
};

// @desc    Create a review for a completed booking
// @route   POST /api/reviews
// @access  Private (customer)
const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  const booking = await Booking.findOne({ _id: bookingId, customer: req.user._id });
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (booking.status !== 'completed') {
    res.status(400);
    throw new Error('You can only review completed appointments');
  }
  if (booking.reviewed) {
    res.status(400);
    throw new Error('You already reviewed this booking');
  }

  const review = await Review.create({
    customer: req.user._id,
    salon: booking.salon,
    booking: booking._id,
    barber: booking.barber,
    rating,
    comment,
  });

  booking.reviewed = true;
  await booking.save();
  await recalcSalonRating(booking.salon);

  res.status(201).json({ success: true, review });
});

// @desc    Get reviews for a salon (public, paginated)
// @route   GET /api/reviews/salon/:salonId
// @access  Public
const getSalonReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const filter = { salon: req.params.salonId, isHidden: false };
  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    Review.find(filter).populate('customer', 'name avatar').sort('-createdAt').skip(skip).limit(Number(limit)),
    Review.countDocuments(filter),
  ]);

  res.json({ success: true, reviews, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// @desc    Report a review as inappropriate
// @route   PUT /api/reviews/:id/report
// @access  Private
const reportReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  review.isReported = true;
  review.reportReason = req.body.reason || 'Not specified';
  await review.save();
  res.json({ success: true, message: 'Review reported. Our team will take a look.' });
});

module.exports = { createReview, getSalonReviews, reportReview };
