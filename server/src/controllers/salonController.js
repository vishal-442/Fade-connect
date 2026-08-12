const asyncHandler = require('express-async-handler');
const Salon = require('../models/Salon');
const Service = require('../models/Service');
const Barber = require('../models/Barber');
const Review = require('../models/Review');
const { uploadImage } = require('../config/cloudinary');

// @desc    Register a new salon (owner)
// @route   POST /api/salons
// @access  Private (owner)
const createSalon = asyncHandler(async (req, res) => {
  const existing = await Salon.findOne({ owner: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You already have a registered salon');
  }

  const { name, description, location, contact, businessHours, amenities, priceLevel } = req.body;

  const salon = await Salon.create({
    owner: req.user._id,
    name,
    description,
    location,
    contact,
    businessHours,
    amenities,
    priceLevel,
    status: 'pending', // awaits admin approval
  });

  res.status(201).json({ success: true, salon });
});

// @desc    Get the logged-in owner's salon
// @route   GET /api/salons/mine
// @access  Private (owner)
const getMySalon = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) {
    res.status(404);
    throw new Error('No salon registered yet');
  }
  res.json({ success: true, salon });
});

// @desc    Update salon profile
// @route   PUT /api/salons/mine
// @access  Private (owner)
const updateSalon = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) {
    res.status(404);
    throw new Error('No salon registered yet');
  }

  const fields = ['name', 'description', 'location', 'contact', 'businessHours', 'amenities', 'priceLevel'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) salon[f] = req.body[f];
  });

  await salon.save();
  res.json({ success: true, salon });
});

// @desc    Upload salon gallery images
// @route   POST /api/salons/mine/images
// @access  Private (owner)
const uploadSalonImages = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) {
    res.status(404);
    throw new Error('No salon registered yet');
  }
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No images provided');
  }

  const uploaded = await Promise.all(req.files.map((f) => uploadImage(f.path, 'fade-connect/salons')));
  salon.images.push(...uploaded.map((u) => ({ url: u.url, publicId: u.publicId || '' })));
  await salon.save();

  res.json({ success: true, images: salon.images });
});

// @desc    Add/remove a blocked (holiday) date
// @route   PUT /api/salons/mine/blocked-dates
// @access  Private (owner)
const toggleBlockedDate = asyncHandler(async (req, res) => {
  const { date, action } = req.body; // action: 'add' | 'remove'
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) {
    res.status(404);
    throw new Error('No salon registered yet');
  }

  const dateStr = new Date(date).toISOString().slice(0, 10);
  const existingIdx = salon.blockedDates.findIndex(
    (d) => new Date(d).toISOString().slice(0, 10) === dateStr
  );

  if (action === 'remove') {
    if (existingIdx > -1) salon.blockedDates.splice(existingIdx, 1);
  } else if (existingIdx === -1) {
    salon.blockedDates.push(new Date(date));
  }

  await salon.save();
  res.json({ success: true, blockedDates: salon.blockedDates });
});

// @desc    Public: search / list salons with filters + pagination
// @route   GET /api/salons
// @access  Public
const listSalons = asyncHandler(async (req, res) => {
  const {
    q,
    city,
    minRating,
    maxPrice,
    service,
    sort = '-createdAt',
    page = 1,
    limit = 12,
  } = req.query;

  const filter = { status: 'approved' };

  if (q) filter.$text = { $search: q };
  if (city) filter['location.city'] = new RegExp(city, 'i');
  if (minRating) filter.ratingAverage = { $gte: Number(minRating) };
  if (maxPrice) filter.priceLevel = { $lte: Number(maxPrice) };

  let salonIdsForService = null;
  if (service) {
    const services = await Service.find({ name: new RegExp(service, 'i'), isActive: true }).select('salon');
    salonIdsForService = services.map((s) => s.salon);
    filter._id = { $in: salonIdsForService };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [salons, total] = await Promise.all([
    Salon.find(filter).sort(sort).skip(skip).limit(Number(limit)),
    Salon.countDocuments(filter),
  ]);

  res.json({
    success: true,
    salons,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Get salon details (public) including services, barbers, reviews
// @route   GET /api/salons/:id
// @access  Public
const getSalonById = asyncHandler(async (req, res) => {
  const salon = await Salon.findById(req.params.id);
  if (!salon) {
    res.status(404);
    throw new Error('Salon not found');
  }

  const [services, barbers, reviews] = await Promise.all([
    Service.find({ salon: salon._id, isActive: true }),
    Barber.find({ salon: salon._id, isActive: true }),
    Review.find({ salon: salon._id, isHidden: false })
      .populate('customer', 'name avatar')
      .sort('-createdAt')
      .limit(20),
  ]);

  res.json({ success: true, salon, services, barbers, reviews });
});

// @desc    Toggle favorite salon
// @route   PUT /api/salons/:id/favorite
// @access  Private (customer)
const toggleFavorite = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const user = await User.findById(req.user._id);
  const idx = user.favorites.findIndex((f) => f.toString() === req.params.id);
  let isFavorite;
  if (idx > -1) {
    user.favorites.splice(idx, 1);
    isFavorite = false;
  } else {
    user.favorites.push(req.params.id);
    isFavorite = true;
  }
  await user.save();
  res.json({ success: true, isFavorite, favorites: user.favorites });
});

// @desc    Get the logged-in customer's favorited salons
// @route   GET /api/salons/mine/favorites
// @access  Private (customer)
const getMyFavorites = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const user = await User.findById(req.user._id).populate('favorites');
  res.json({ success: true, salons: user.favorites });
});

module.exports = {
  createSalon,
  getMySalon,
  updateSalon,
  uploadSalonImages,
  toggleBlockedDate,
  listSalons,
  getSalonById,
  toggleFavorite,
  getMyFavorites,
};
