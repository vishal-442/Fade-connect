const Service = require('../models/Service');
const Salon = require('../models/Salon');
const { Types } = require('mongoose');

const createService = async (req, res) => {
  if (!Types.ObjectId.isValid(req.body.salon)) {
    return res.status(400).json({ message: 'Invalid salon id' });
  }

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
  let query = {};
  if (req.query.salon) {
    if (!Types.ObjectId.isValid(req.query.salon)) {
      return res.status(400).json({ message: 'Invalid salon id' });
    }
    query = { salon: Types.ObjectId.createFromHexString(String(req.query.salon)) };
  }

  const services = await Service.find(query).sort({ createdAt: -1 });
  return res.json(services);
};

const updateService = async (req, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid service id' });
  }

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
  if (!Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid service id' });
  }

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
