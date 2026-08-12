const asyncHandler = require('express-async-handler');
const Salon = require('../models/Salon');
const Service = require('../models/Service');
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

// @desc    Add a service
// @route   POST /api/services
// @access  Private (owner)
const addService = asyncHandler(async (req, res) => {
  const salon = await getOwnedSalonOrFail(req.user._id);
  const { name, description, category, price, durationMinutes } = req.body;

  const service = await Service.create({
    salon: salon._id,
    name,
    description,
    category,
    price,
    durationMinutes,
  });

  res.status(201).json({ success: true, service });
});

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (owner)
const updateService = asyncHandler(async (req, res) => {
  const salon = await getOwnedSalonOrFail(req.user._id);
  const service = await Service.findOne({ _id: req.params.id, salon: salon._id });
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  const fields = ['name', 'description', 'category', 'price', 'durationMinutes', 'isActive'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) service[f] = req.body[f];
  });

  await service.save();
  res.json({ success: true, service });
});

// @desc    Upload a service image
// @route   PUT /api/services/:id/image
// @access  Private (owner)
const uploadServiceImage = asyncHandler(async (req, res) => {
  const salon = await getOwnedSalonOrFail(req.user._id);
  const service = await Service.findOne({ _id: req.params.id, salon: salon._id });
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  const result = await uploadImage(req.file.path, 'fade-connect/services');
  service.image = { url: result.url, publicId: result.publicId || '' };
  await service.save();

  res.json({ success: true, service });
});

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (owner)
const deleteService = asyncHandler(async (req, res) => {
  const salon = await getOwnedSalonOrFail(req.user._id);
  const service = await Service.findOneAndDelete({ _id: req.params.id, salon: salon._id });
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  res.json({ success: true, message: 'Service removed' });
});

// @desc    Get services for a salon (public)
// @route   GET /api/services/salon/:salonId
// @access  Public
const getServicesBySalon = asyncHandler(async (req, res) => {
  const services = await Service.find({ salon: req.params.salonId, isActive: true });
  res.json({ success: true, services });
});

// @desc    Get services for the owner's own salon (includes inactive)
// @route   GET /api/services/mine
// @access  Private (owner)
const getMyServices = asyncHandler(async (req, res) => {
  const salon = await getOwnedSalonOrFail(req.user._id);
  const services = await Service.find({ salon: salon._id });
  res.json({ success: true, services });
});

module.exports = {
  addService,
  updateService,
  uploadServiceImage,
  deleteService,
  getServicesBySalon,
  getMyServices,
};
