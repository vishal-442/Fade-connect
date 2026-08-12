const asyncHandler = require('express-async-handler');
const Salon = require('../models/Salon');
const Barber = require('../models/Barber');
const Service = require('../models/Service');
const TimeSlot = require('../models/TimeSlot');
const { generateDaySlots, dateToDayKey } = require('../utils/slotGenerator');
const { findAvailableStartTimes } = require('../utils/availability');

// @desc    Generate slots for a barber across a date range, based on salon
//          business hours (skips blocked/holiday dates and barber off-days)
// @route   POST /api/slots/generate
// @access  Private (owner)
const generateSlots = asyncHandler(async (req, res) => {
  const { barberId, startDate, endDate, granularityMinutes = 30 } = req.body;

  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) {
    res.status(404);
    throw new Error('No salon registered yet');
  }
  const barber = await Barber.findOne({ _id: barberId, salon: salon._id });
  if (!barber) {
    res.status(404);
    throw new Error('Barber not found');
  }

  const blockedSet = new Set(salon.blockedDates.map((d) => new Date(d).toISOString().slice(0, 10)));
  const created = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    if (blockedSet.has(dateStr)) continue;

    const dayKey = dateToDayKey(d);
    if (barber.workingDays.length && !barber.workingDays.includes(dayKey)) continue;

    const hours = salon.businessHours.find((h) => h.day === dayKey);
    if (!hours || !hours.isOpen) continue;

    const windows = generateDaySlots({
      open: hours.open,
      close: hours.close,
      durationMinutes: Number(granularityMinutes),
    });

    for (const w of windows) {
      created.push({
        salon: salon._id,
        barber: barber._id,
        date: dateStr,
        startTime: w.startTime,
        endTime: w.endTime,
      });
    }
  }

  if (created.length) {
    // ordered:false lets valid inserts succeed even if some slots already exist (unique index)
    await TimeSlot.insertMany(created, { ordered: false }).catch(() => {});
  }

  res.status(201).json({ success: true, generated: created.length });
});

// @desc    Public - get available appointment start times for a barber/date/service
// @route   GET /api/slots/available?barberId=&date=&serviceId=
// @access  Public
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { barberId, date, serviceId } = req.query;
  if (!barberId || !date || !serviceId) {
    res.status(400);
    throw new Error('barberId, date and serviceId are required');
  }

  const service = await Service.findById(serviceId);
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  const options = await findAvailableStartTimes(barberId, date, service.durationMinutes);
  res.json({
    success: true,
    date,
    durationMinutes: service.durationMinutes,
    slots: options.map((o) => ({ startTime: o.startTime, endTime: o.endTime })),
  });
});

// @desc    Delete all slots for a barber on a given date (owner)
// @route   DELETE /api/slots?barberId=&date=
// @access  Private (owner)
const clearSlotsForDate = asyncHandler(async (req, res) => {
  const { barberId, date } = req.query;
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) {
    res.status(404);
    throw new Error('No salon registered yet');
  }
  const result = await TimeSlot.deleteMany({ barber: barberId, salon: salon._id, date, isBooked: false });
  res.json({ success: true, deleted: result.deletedCount });
});

module.exports = { generateSlots, getAvailableSlots, clearSlotsForDate };
