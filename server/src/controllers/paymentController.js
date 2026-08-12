const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const { nanoid } = require('nanoid');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { razorpayInstance, mockPayments } = require('../config/razorpay');
const sendEmail = require('../utils/sendEmail');

// @desc    Create a Razorpay order for a booking (or a mock order in dev)
// @route   POST /api/payments/order
// @access  Private (customer)
const createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  const booking = await Booking.findOne({ _id: bookingId, customer: req.user._id });
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (booking.paymentStatus === 'paid') {
    res.status(400);
    throw new Error('This booking has already been paid for');
  }

  const amountPaise = Math.round(booking.priceAtBooking * 100);

  let order;
  if (mockPayments) {
    order = { id: `mock_order_${nanoid(12)}`, amount: amountPaise, currency: 'INR', mock: true };
  } else {
    order = await razorpayInstance.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `booking_${booking._id}`,
    });
  }

  const payment = await Payment.create({
    booking: booking._id,
    customer: req.user._id,
    salon: booking.salon,
    amount: booking.priceAtBooking,
    razorpayOrderId: order.id,
    status: 'created',
    isMock: mockPayments,
  });

  booking.payment = payment._id;
  await booking.save();

  res.status(201).json({
    success: true,
    order,
    paymentId: payment._id,
    keyId: mockPayments ? null : process.env.RAZORPAY_KEY_ID,
    mock: mockPayments,
  });
});

// @desc    Verify payment signature (or auto-confirm in mock mode) and mark booking paid
// @route   POST /api/payments/verify
// @access  Private (customer)
const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const payment = await Payment.findById(paymentId);
  if (!payment || payment.customer.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Payment record not found');
  }

  if (!payment.isMock) {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      payment.status = 'failed';
      await payment.save();
      res.status(400);
      throw new Error('Payment verification failed - signature mismatch');
    }
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
  } else {
    payment.razorpayPaymentId = `mock_pay_${nanoid(12)}`;
  }

  payment.status = 'paid';
  payment.method = payment.isMock ? 'mock' : 'razorpay';
  payment.invoiceNumber = `INV-${Date.now()}-${nanoid(6).toUpperCase()}`;
  await payment.save();

  const booking = await Booking.findById(payment.booking).populate('service', 'name');
  booking.paymentStatus = 'paid';
  booking.status = 'confirmed';
  await booking.save();

  await Notification.create({
    user: req.user._id,
    type: 'payment_confirmation',
    title: 'Payment successful',
    message: `Payment of ₹${payment.amount} confirmed for ${booking.service.name} on ${booking.date}.`,
    link: '/bookings',
  }).catch(() => {});

  sendEmail({
    to: req.user.email,
    subject: 'Fade Connect - Booking Invoice',
    text: `Invoice ${payment.invoiceNumber}\nService: ${booking.service.name}\nDate: ${booking.date} ${booking.startTime}\nAmount paid: ₹${payment.amount}`,
  }).catch(() => {});

  res.json({ success: true, payment, booking });
});

// @desc    Get the logged-in customer's payment history / invoices
// @route   GET /api/payments/mine
// @access  Private (customer)
const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ customer: req.user._id })
    .populate({ path: 'booking', populate: { path: 'service', select: 'name' } })
    .populate('salon', 'name')
    .sort('-createdAt');
  res.json({ success: true, payments });
});

module.exports = { createOrder, verifyPayment, getMyPayments };
