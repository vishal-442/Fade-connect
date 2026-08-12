const asyncHandler = require('express-async-handler');
const Salon = require('../models/Salon');
const Barber = require('../models/Barber');
const { uploadImage } = require('../config/cloudinary');

const getOwnedSalonOrFail = async (userId) => {
  const salon = await Salon.findOne({ owner: userId });
  if (!salon) {
    const err = new Error('No salon registered yet');
    err.statusCode = 404;
    throw err;
  }
  return salon;
};

// @desc    Add a barber to the owner's salon
// @route   POST /api/barbers
// @access  Private (owner)
const addBarber = asyncHandler(async (req, res) => {
  const salon = await getOwnedSalonOrFail(req.user._id);
  const { name, bio, specialties, experienceYears, workingDays, services } = req.body;

  const barber = await Barber.create({
    salon: salon._id,
    name,
    bio,
    specialties,
    experienceYears,
    workingDays,
    services,
  });

  res.status(201).json({ success: true, barber });
});

// @desc    Update a barber
// @route   PUT /api/barbers/:id
// @access  Private (owner)
const updateBarber = asyncHandler(async (req, res) => {
  const salon = await getOwnedSalonOrFail(req.user._id);
  const barber = await Barber.findOne({ _id: req.params.id, salon: salon._id });
  if (!barber) {
    res.status(404);
    throw new Error('Barber not found');
  }

  const fields = ['name', 'bio', 'specialties', 'experienceYears', 'workingDays', 'services', 'isActive'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) barber[f] = req.body[f];
  });

  await barber.save();
  res.json({ success: true, barber });
});

// @desc    Upload a barber's photo
// @route   PUT /api/barbers/:id/photo
// @access  Private (owner)
const uploadBarberPhoto = asyncHandler(async (req, res) => {
  const salon = await getOwnedSalonOrFail(req.user._id);
  const barber = await Barber.findOne({ _id: req.params.id, salon: salon._id });
  if (!barber) {
    res.status(404);
    throw new Error('Barber not found');
  }
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  const result = await uploadImage(req.file.path, 'fade-connect/barbers');
  barber.photo = { url: result.url, publicId: result.publicId || '' };
  await barber.save();

  res.json({ success: true, barber });
});

// @desc    Delete a barber
// @route   DELETE /api/barbers/:id
// @access  Private (owner)
const deleteBarber = asyncHandler(async (req, res) => {
  const salon = await getOwnedSalonOrFail(req.user._id);
  const barber = await Barber.findOneAndDelete({ _id: req.params.id, salon: salon._id });
  if (!barber) {
    res.status(404);
    throw new Error('Barber not found');
  }
  res.json({ success: true, message: 'Barber removed' });
});

// @desc    Get all barbers for a salon (public)
// @route   GET /api/barbers/salon/:salonId
// @access  Public
const getBarbersBySalon = asyncHandler(async (req, res) => {
  const barbers = await Barber.find({ salon: req.params.salonId, isActive: true }).populate(
    'services',
    'name price durationMinutes'
  );
  res.json({ success: true, barbers });
});

// @desc    Get barbers for the owner's own salon (includes inactive)
// @route   GET /api/barbers/mine
// @access  Private (owner)
const getMyBarbers = asyncHandler(async (req, res) => {
  const salon = await getOwnedSalonOrFail(req.user._id);
  const barbers = await Barber.find({ salon: salon._id }).populate('services', 'name price');
  res.json({ success: true, barbers });
});

module.exports = { addBarber, updateBarber, uploadBarberPhoto, deleteBarber, getBarbersBySalon, getMyBarbers };
