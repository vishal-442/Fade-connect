const TimeSlot = require('../models/TimeSlot');
const { toMinutes, toHHMM } = require('./slotGenerator');

/**
 * Given a barber + date, returns valid appointment start times that can fit
 * `durationMinutes` using one or more contiguous, unbooked TimeSlot documents.
 * Each result also carries the underlying slot ids so a booking can atomically
 * reserve exactly the slots it consumes.
 */
const findAvailableStartTimes = async (barberId, date, durationMinutes) => {
  const slots = await TimeSlot.find({ barber: barberId, date, isBooked: false }).sort('startTime');
  if (slots.length === 0) return [];

  const results = [];

  for (let i = 0; i < slots.length; i += 1) {
    const chain = [slots[i]];
    let coveredMinutes = toMinutes(slots[i].endTime) - toMinutes(slots[i].startTime);
    let cursor = toMinutes(slots[i].endTime);

    if (coveredMinutes >= durationMinutes) {
      results.push({
        startTime: slots[i].startTime,
        endTime: toHHMM(toMinutes(slots[i].startTime) + durationMinutes),
        slotIds: [slots[i]._id],
      });
      continue;
    }

    for (let j = i + 1; j < slots.length; j += 1) {
      if (toMinutes(slots[j].startTime) !== cursor) break; // not contiguous
      chain.push(slots[j]);
      coveredMinutes += toMinutes(slots[j].endTime) - toMinutes(slots[j].startTime);
      cursor = toMinutes(slots[j].endTime);
      if (coveredMinutes >= durationMinutes) {
        results.push({
          startTime: slots[i].startTime,
          endTime: toHHMM(toMinutes(slots[i].startTime) + durationMinutes),
          slotIds: chain.map((s) => s._id),
        });
        break;
      }
    }
  }

  return results;
};

/**
 * Atomically reserves the slot chain that begins at `startTime` and can
 * cover `durationMinutes`. Returns the reserved slotIds + computed endTime,
 * or null if that exact start time is no longer available (race condition).
 */
const reserveSlotsForBooking = async (barberId, date, startTime, durationMinutes) => {
  const options = await findAvailableStartTimes(barberId, date, durationMinutes);
  const match = options.find((o) => o.startTime === startTime);
  if (!match) return null;

  const result = await TimeSlot.updateMany(
    { _id: { $in: match.slotIds }, isBooked: false },
    { $set: { isBooked: true } }
  );

  if (result.modifiedCount !== match.slotIds.length) {
    // Race condition: someone else grabbed one of these slots first, roll back.
    await TimeSlot.updateMany({ _id: { $in: match.slotIds } }, { $set: { isBooked: false } });
    return null;
  }

  return { slotIds: match.slotIds, endTime: match.endTime };
};

const releaseSlots = async (slotIds) => {
  await TimeSlot.updateMany({ _id: { $in: slotIds } }, { $set: { isBooked: false, booking: null } });
};

module.exports = { findAvailableStartTimes, reserveSlotsForBooking, releaseSlots };
