const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Barber = require('../models/Barber');
const Salon = require('../models/Salon');
const TimeSlot = require('../models/TimeSlot');
const Notification = require('../models/Notification');
const { reserveSlotsForBooking, releaseSlots } = require('../utils/availability');
const sendEmail = require('../utils/sendEmail');

const notify = async (userId, payload) => {
  await Notification.create({ user: userId, ...payload }).catch(() => {});
};

// @desc    Create a booking (reserves slot(s), status = pending until payment)
// @route   POST /api/bookings
// @access  Private (customer)
const createBooking = asyncHandler(async (req, res) => {
  const { salonId, barberId, serviceId, date, startTime, notes } = req.body;

  const [salon, barber, service] = await Promise.all([
    Salon.findById(salonId),
    Barber.findById(barberId),
    Service.findById(serviceId),
  ]);
  if (!salon || !barber || !service) {
    res.status(404);
    throw new Error('Salon, barber or service not found');
  }

  const reservation = await reserveSlotsForBooking(barberId, date, startTime, service.durationMinutes);
  if (!reservation) {
    res.status(409);
    throw new Error('That time slot is no longer available. Please pick another.');
  }

  const booking = await Booking.create({
    customer: req.user._id,
    salon: salonId,
    barber: barberId,
    service: serviceId,
    timeSlot: reservation.slotIds[0],
    date,
    startTime,
    endTime: reservation.endTime,
    priceAtBooking: service.price,
    notes: notes || '',
    status: 'pending',
    paymentStatus: 'unpaid',
  });

  await TimeSlot.updateMany({ _id: { $in: reservation.slotIds } }, { $set: { booking: booking._id } });

  await notify(salon.owner, {
    type: 'booking_request',
    title: 'New booking request',
    message: `${req.user.name} requested ${service.name} on ${date} at ${startTime}`,
    link: '/owner/bookings',
  });

  res.status(201).json({ success: true, booking });
});

// @desc    Get a single booking (owner customer, or the salon's owner)
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('salon', 'name owner location images')
    .populate('barber', 'name photo')
    .populate('service', 'name price durationMinutes');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const isOwnerOfBooking = booking.customer.toString() === req.user._id.toString();
  const isSalonOwner = req.user.role === 'owner' && booking.salon.owner.toString() === req.user._id.toString();
  if (!isOwnerOfBooking && !isSalonOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this booking');
  }

  res.json({ success: true, booking });
});

// @desc    Get the logged-in customer's bookings (history)
// @route   GET /api/bookings/mine
// @access  Private (customer)
const getMyBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { customer: req.user._id };
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .populate('salon', 'name images location')
    .populate('barber', 'name photo')
    .populate('service', 'name price durationMinutes')
    .sort('-createdAt');

  res.json({ success: true, bookings });
});

// @desc    Get all bookings for the owner's salon (with filters)
// @route   GET /api/bookings/salon
// @access  Private (owner)
const getSalonBookings = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) {
    res.status(404);
    throw new Error('No salon registered yet');
  }
  const { status, date } = req.query;
  const filter = { salon: salon._id };
  if (status) filter.status = status;
  if (date) filter.date = date;

  const bookings = await Booking.find(filter)
    .populate('customer', 'name phone email avatar')
    .populate('barber', 'name')
    .populate('service', 'name price durationMinutes')
    .sort('-createdAt');

  res.json({ success: true, bookings });
});

// @desc    Get today's appointments for the owner's salon
// @route   GET /api/bookings/salon/today
// @access  Private (owner)
const getTodayBookings = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) {
    res.status(404);
    throw new Error('No salon registered yet');
  }
  const today = new Date().toISOString().slice(0, 10);
  const bookings = await Booking.find({ salon: salon._id, date: today })
    .populate('customer', 'name phone avatar')
    .populate('barber', 'name')
    .populate('service', 'name durationMinutes')
    .sort('startTime');

  res.json({ success: true, date: today, bookings });
});

// @desc    Owner accepts/rejects/completes a booking
// @route   PUT /api/bookings/:id/status
// @access  Private (owner)
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body; // 'confirmed' | 'rejected' | 'completed'
  const allowed = ['confirmed', 'rejected', 'completed'];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${allowed.join(', ')}`);
  }

  const salon = await Salon.findOne({ owner: req.user._id });
  const booking = await Booking.findOne({ _id: req.params.id, salon: salon._id }).populate('service', 'name');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  booking.status = status;
  if (status === 'rejected') {
    booking.cancelReason = reason || 'Rejected by salon';
    await releaseSlots([booking.timeSlot]);
  }
  await booking.save();

  await notify(booking.customer, {
    type: status === 'rejected' ? 'cancellation' : 'booking_confirmation',
    title: `Booking ${status}`,
    message: `Your booking for ${booking.service.name} on ${booking.date} was ${status}.`,
    link: '/bookings',
  });

  res.json({ success: true, booking });
});

// @desc    Customer cancels a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (customer)
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, customer: req.user._id });
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (['completed', 'cancelled', 'rejected'].includes(booking.status)) {
    res.status(400);
    throw new Error(`A ${booking.status} booking cannot be cancelled`);
  }

  booking.status = 'cancelled';
  booking.cancelReason = req.body.reason || 'Cancelled by customer';
  await booking.save();
  await releaseSlots([booking.timeSlot]);

  const salon = await Salon.findById(booking.salon);
  await notify(salon.owner, {
    type: 'cancellation',
    title: 'Booking cancelled',
    message: `A customer cancelled their booking on ${booking.date} at ${booking.startTime}.`,
    link: '/owner/bookings',
  });

  res.json({ success: true, booking });
});

// @desc    Customer reschedules a booking to a new date/time
// @route   PUT /api/bookings/:id/reschedule
// @access  Private (customer)
const rescheduleBooking = asyncHandler(async (req, res) => {
  const { date, startTime } = req.body;
  const oldBooking = await Booking.findOne({ _id: req.params.id, customer: req.user._id }).populate(
    'service'
  );
  if (!oldBooking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (['completed', 'cancelled', 'rejected'].includes(oldBooking.status)) {
    res.status(400);
    throw new Error(`A ${oldBooking.status} booking cannot be rescheduled`);
  }

  const reservation = await reserveSlotsForBooking(
    oldBooking.barber,
    date,
    startTime,
    oldBooking.service.durationMinutes
  );
  if (!reservation) {
    res.status(409);
    throw new Error('That time slot is no longer available. Please pick another.');
  }

  // free the old slot(s), mark old booking as rescheduled
  await releaseSlots([oldBooking.timeSlot]);
  oldBooking.status = 'rescheduled';
  await oldBooking.save();

  const newBooking = await Booking.create({
    customer: req.user._id,
    salon: oldBooking.salon,
    barber: oldBooking.barber,
    service: oldBooking.service._id,
    timeSlot: reservation.slotIds[0],
    date,
    startTime,
    endTime: reservation.endTime,
    priceAtBooking: oldBooking.priceAtBooking,
    status: oldBooking.paymentStatus === 'paid' ? 'confirmed' : 'pending',
    paymentStatus: oldBooking.paymentStatus,
    payment: oldBooking.payment,
    rescheduledFrom: oldBooking._id,
  });
  await TimeSlot.updateMany({ _id: { $in: reservation.slotIds } }, { $set: { booking: newBooking._id } });

  res.json({ success: true, booking: newBooking });
});

module.exports = {
  createBooking,
  getBookingById,
  getMyBookings,
  getSalonBookings,
  getTodayBookings,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking,
};
