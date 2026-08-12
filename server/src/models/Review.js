const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    barber: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000, default: '' },
    isReported: { type: Boolean, default: false },
    reportReason: { type: String, default: '' },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ salon: 1, createdAt: -1 });
reviewSchema.index({ booking: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
