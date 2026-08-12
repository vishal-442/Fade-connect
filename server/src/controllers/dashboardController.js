const asyncHandler = require('express-async-handler');
const Salon = require('../models/Salon');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @desc    Owner analytics: today's/weekly bookings, monthly revenue,
//          popular services, peak hours, top customers
// @route   GET /api/dashboard/owner
// @access  Private (owner)
const getOwnerDashboard = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) {
    res.status(404);
    throw new Error('No salon registered yet');
  }

  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [todayCount, weeklyCount, monthlyRevenueAgg, popularServices, topCustomers, statusBreakdown] =
    await Promise.all([
      Booking.countDocuments({ salon: salon._id, date: today, status: { $ne: 'cancelled' } }),
      Booking.countDocuments({ salon: salon._id, createdAt: { $gte: sevenDaysAgo } }),
      Payment.aggregate([
        { $match: { salon: salon._id, status: 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { salon: salon._id, status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: '$service', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'service' } },
        { $unwind: '$service' },
        { $project: { name: '$service.name', count: 1 } },
      ]),
      Booking.aggregate([
        { $match: { salon: salon._id, status: { $ne: 'cancelled' } } },
        { $group: { _id: '$customer', visits: { $sum: 1 }, spend: { $sum: '$priceAtBooking' } } },
        { $sort: { visits: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'customer' } },
        { $unwind: '$customer' },
        { $project: { name: '$customer.name', visits: 1, spend: 1 } },
      ]),
      Booking.aggregate([
        { $match: { salon: salon._id, status: { $ne: 'cancelled' } } },
        { $group: { _id: '$startTime', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
    ]);

  res.json({
    success: true,
    todayBookings: todayCount,
    weeklyBookings: weeklyCount,
    monthlyRevenue: monthlyRevenueAgg[0]?.total || 0,
    monthlyPaidCount: monthlyRevenueAgg[0]?.count || 0,
    popularServices,
    topCustomers,
    peakHours: statusBreakdown,
    salonStatus: salon.status,
  });
});

module.exports = { getOwnerDashboard };
