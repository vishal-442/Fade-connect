const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    appointmentTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending'
    },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

bookingSchema.index({ worker: 1, appointmentTime: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
