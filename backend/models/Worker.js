const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    experienceYears: { type: Number, min: 0, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    availableSlots: [{ type: Date }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Worker', workerSchema);
