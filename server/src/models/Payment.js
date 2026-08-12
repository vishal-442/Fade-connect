const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded'],
      default: 'created',
    },
    method: { type: String, default: '' },
    isMock: { type: Boolean, default: false },
    invoiceNumber: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
