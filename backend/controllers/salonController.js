const Salon = require('../models/Salon');
const Service = require('../models/Service');
const Worker = require('../models/Worker');

const createSalon = async (req, res) => {
  const salon = await Salon.create({ ...req.body, owner: req.user._id });
  return res.status(201).json(salon);
};

const listSalons = async (req, res) => {
  const { city, q } = req.query;
  const query = {};

  if (city) {
    query['address.city'] = new RegExp(`^${city}$`, 'i');
  }

  if (q) {
    query.$or = [{ name: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
  }

  const salons = await Salon.find(query).sort({ rating: -1, createdAt: -1 });
  return res.json(salons);
};

const getSalonById = async (req, res) => {
  const salon = await Salon.findById(req.params.id).populate('owner', 'name email phone');
  if (!salon) {
    return res.status(404).json({ message: 'Salon not found' });
  }

  const [services, workers] = await Promise.all([
    Service.find({ salon: salon._id }),
    Worker.find({ salon: salon._id }).populate('services', 'name durationMinutes price')
  ]);

  return res.json({ salon, services, workers });
};

const updateSalon = async (req, res) => {
  const salon = await Salon.findById(req.params.id);
  if (!salon) {
    return res.status(404).json({ message: 'Salon not found' });
  }

  if (String(salon.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  Object.assign(salon, req.body);
  await salon.save();
  return res.json(salon);
};

const deleteSalon = async (req, res) => {
  const salon = await Salon.findById(req.params.id);
  if (!salon) {
    return res.status(404).json({ message: 'Salon not found' });
  }

  if (String(salon.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await Promise.all([
    Service.deleteMany({ salon: salon._id }),
    Worker.deleteMany({ salon: salon._id }),
    Salon.findByIdAndDelete(salon._id)
  ]);

  return res.json({ message: 'Salon deleted' });
};

module.exports = { createSalon, listSalons, getSalonById, updateSalon, deleteSalon };
