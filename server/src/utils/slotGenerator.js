const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const toHHMM = (mins) => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Generates an array of { startTime, endTime } slot windows for one day,
 * given the salon's open/close hours and a service duration.
 */
const generateDaySlots = ({ open, close, durationMinutes, bufferMinutes = 0 }) => {
  const slots = [];
  const start = toMinutes(open);
  const end = toMinutes(close);
  const step = durationMinutes + bufferMinutes;

  for (let t = start; t + durationMinutes <= end; t += step) {
    slots.push({ startTime: toHHMM(t), endTime: toHHMM(t + durationMinutes) });
  }
  return slots;
};

/** Maps a JS Date to the salon's day-key ('sun'..'sat') */
const dateToDayKey = (date) => DAY_KEYS[new Date(date).getDay()];

module.exports = { generateDaySlots, dateToDayKey, toMinutes, toHHMM, DAY_KEYS };
