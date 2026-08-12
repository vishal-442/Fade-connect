const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    name: { type: String, required: [true, 'Service name is required'], trim: true },
    description: { type: String, maxlength: 500, default: '' },
    category: {
      type: String,
      enum: ['Hair Cut', 'Beard Trim', 'Hair Spa', 'Hair Coloring', 'Facial', 'Shaving', 'Other'],
      default: 'Other',
    },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    durationMinutes: { type: Number, required: [true, 'Duration is required'], min: 5 },
    image: { url: String, publicId: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ salon: 1 });

module.exports = mongoose.model('Service', serviceSchema);
