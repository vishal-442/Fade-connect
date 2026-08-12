const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    durationMinutes: { type: Number, required: true, min: 5 },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
