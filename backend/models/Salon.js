const mongoose = require('mongoose');

const salonSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    address: {
      line1: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true }
    },
    phone: { type: String, trim: true },
    rating: { type: Number, min: 0, max: 5, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Salon', salonSchema);
