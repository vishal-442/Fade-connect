const Worker = require('../models/Worker');
const Salon = require('../models/Salon');

const createWorker = async (req, res) => {
  const salon = await Salon.findById(req.body.salon);
  if (!salon) {
    return res.status(404).json({ message: 'Salon not found' });
  }

  if (String(salon.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const worker = await Worker.create({
    ...req.body,
    availableSlots: (req.body.availableSlots || []).map((slot) => new Date(slot))
  });

  return res.status(201).json(worker);
};

const listWorkers = async (req, res) => {
  const query = req.query.salon ? { salon: req.query.salon } : {};
  const workers = await Worker.find(query).populate('services', 'name durationMinutes price');
  return res.json(workers);
};

const updateWorker = async (req, res) => {
  const worker = await Worker.findById(req.params.id).populate('salon');
  if (!worker) {
    return res.status(404).json({ message: 'Worker not found' });
  }

  if (String(worker.salon.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const payload = { ...req.body };
  if (payload.availableSlots) {
    payload.availableSlots = payload.availableSlots.map((slot) => new Date(slot));
  }

  Object.assign(worker, payload);
  await worker.save();
  return res.json(worker);
};

const deleteWorker = async (req, res) => {
  const worker = await Worker.findById(req.params.id).populate('salon');
  if (!worker) {
    return res.status(404).json({ message: 'Worker not found' });
  }

  if (String(worker.salon.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await Worker.findByIdAndDelete(worker._id);
  return res.json({ message: 'Worker deleted' });
};

module.exports = { createWorker, listWorkers, updateWorker, deleteWorker };
