const mongoose = require('mongoose');

const businessHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
      required: true,
    },
    isOpen: { type: Boolean, default: true },
    open: { type: String, default: '09:00' }, // 24h "HH:mm"
    close: { type: String, default: '20:00' },
  },
  { _id: false }
);

const salonSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Salon name is required'], trim: true, maxlength: 80 },
    description: { type: String, maxlength: 2000, default: '' },
    images: [{ url: String, publicId: String }],
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    contact: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    businessHours: { type: [businessHourSchema], default: [] },
    blockedDates: [{ type: Date }], // holiday management
    amenities: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'blocked'],
      default: 'pending',
    },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    priceLevel: { type: Number, min: 1, max: 4, default: 2 }, // $ .. $$$$
  },
  { timestamps: true }
);

salonSchema.index({ name: 'text', 'location.city': 'text' });
salonSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('Salon', salonSchema);
