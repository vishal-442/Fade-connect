const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    barber: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    timeSlot: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeSlot', required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    priceAtBooking: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled', 'rescheduled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'failed'],
      default: 'unpaid',
    },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    notes: { type: String, maxlength: 300, default: '' },
    cancelReason: { type: String, default: '' },
    rescheduledFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
    reviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ salon: 1, date: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
