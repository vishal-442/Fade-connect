const mongoose = require('mongoose');

const barberSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    name: { type: String, required: [true, 'Barber name is required'], trim: true },
    photo: { url: String, publicId: String },
    bio: { type: String, maxlength: 500, default: '' },
    specialties: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    workingDays: [{ type: String, enum: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] }],
    isActive: { type: Boolean, default: true },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

barberSchema.index({ salon: 1 });

module.exports = mongoose.model('Barber', barberSchema);
