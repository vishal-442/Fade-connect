const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const Service = require('../models/Service');
const { Types } = require('mongoose');

const createBooking = async (req, res) => {
  const { salon, service, worker, appointmentTime, notes } = req.body;
  if (![salon, service, worker].every((value) => Types.ObjectId.isValid(value))) {
    return res.status(400).json({ message: 'Invalid booking reference id' });
  }

  const workerId = Types.ObjectId.createFromHexString(String(worker));
  const serviceId = Types.ObjectId.createFromHexString(String(service));

  const [workerDoc, serviceDoc] = await Promise.all([
    Worker.findById(workerId),
    Service.findById(serviceId)
  ]);

  if (!workerDoc || !serviceDoc) {
    return res.status(404).json({ message: 'Worker or service not found' });
  }

  if (String(workerDoc.salon) !== String(salon) || String(serviceDoc.salon) !== String(salon)) {
    return res.status(400).json({ message: 'Worker/service mismatch with salon' });
  }

  const slotTime = new Date(appointmentTime);
  const slotExists = workerDoc.availableSlots.some(
    (slot) => new Date(slot).getTime() === slotTime.getTime()
  );

  if (!slotExists) {
    return res.status(400).json({ message: 'Selected slot is unavailable' });
  }

  const booking = await Booking.create({
    user: req.user._id,
    salon,
    service,
    worker,
    appointmentTime: slotTime,
    notes
  });

  workerDoc.availableSlots = workerDoc.availableSlots.filter(
    (slot) => new Date(slot).getTime() !== slotTime.getTime()
  );
  await workerDoc.save();

  return res.status(201).json(booking);
};

const listMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('salon', 'name address rating')
    .populate('service', 'name durationMinutes price')
    .populate('worker', 'name specialization')
    .sort({ appointmentTime: 1 });

  return res.json(bookings);
};

const listOwnerBookings = async (req, res) => {
  const bookings = await Booking.find()
    .populate({
      path: 'salon',
      match: { owner: req.user._id },
      select: 'name owner'
    })
    .populate('service', 'name durationMinutes price')
    .populate('worker', 'name specialization')
    .populate('user', 'name email phone')
    .sort({ appointmentTime: 1 });

  return res.json(bookings.filter((booking) => booking.salon));
};

const updateBookingStatus = async (req, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid booking id' });
  }

  const booking = await Booking.findById(req.params.id).populate('salon');
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  const canManage =
    req.user.role === 'admin' ||
    req.user.role === 'owner' ||
    String(booking.user) === String(req.user._id);

  if (!canManage) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (req.user.role === 'owner' && String(booking.salon.owner) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  booking.status = req.body.status;
  await booking.save();

  return res.json(booking);
};

module.exports = { createBooking, listMyBookings, listOwnerBookings, updateBookingStatus };
