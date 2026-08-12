const Razorpay = require('razorpay');

const isConfigured = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
const mockPayments = process.env.MOCK_PAYMENTS === 'true' || !isConfigured;

const razorpayInstance = isConfigured
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

module.exports = { razorpayInstance, isConfigured, mockPayments };
