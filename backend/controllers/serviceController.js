const Service = require('../models/Service');
const Salon = require('../models/Salon');

const createService = async (req, res) => {
  const salon = await Salon.findById(req.body.salon);
  if (!salon) {
    return res.status(404).json({ message: 'Salon not found' });
  }

  if (String(salon.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const service = await Service.create(req.body);
  return res.status(201).json(service);
};

const listServices = async (req, res) => {
  const query = req.query.salon ? { salon: req.query.salon } : {};
  const services = await Service.find(query).sort({ createdAt: -1 });
  return res.json(services);
};

const updateService = async (req, res) => {
  const service = await Service.findById(req.params.id).populate('salon');
  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }

  if (String(service.salon.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  Object.assign(service, req.body);
  await service.save();
  return res.json(service);
};

const deleteService = async (req, res) => {
  const service = await Service.findById(req.params.id).populate('salon');
  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }

  if (String(service.salon.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await Service.findByIdAndDelete(req.params.id);
  return res.json({ message: 'Service deleted' });
};

module.exports = { createService, listServices, updateService, deleteService };
