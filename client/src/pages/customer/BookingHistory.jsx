import { useEffect, useState } from 'react';
import { CalendarDays, Clock, MapPin, X, RotateCcw, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Spinner, EmptyState, StatusBadge } from '../../components/ui/Primitives';
import { StarRating } from '../../components/ui/StarRating';

const TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

function RescheduleModal({ booking, onClose, onDone }) {
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    api
      .get('/slots/available', { params: { barberId: booking.barber._id, date, serviceId: booking.service._id } })
      .then(({ data }) => setSlots(data.slots))
      .finally(() => setLoading(false));
  }, [date, booking]);

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.put(`/bookings/${booking._id}/reschedule`, { date, startTime });
      toast.success('Booking rescheduled');
      onDone();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="glass-panel w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg text-warmwhite">Reschedule</h3>
          <button onClick={onClose} className="text-slate-soft hover:text-warmwhite"><X size={18} /></button>
        </div>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-soft">New date</span>
          <input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
        </label>
        {date && (
          <div className="mt-4">
            {loading ? <Spinner label="Checking slots" /> : slots.length === 0 ? (
              <p className="text-sm text-slate-soft">No open slots that day.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((s) => (
                  <button key={s.startTime} onClick={() => setStartTime(s.startTime)} className={`rounded-lg border px-2 py-2 text-sm ${startTime === s.startTime ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-slate-soft'}`}>
                    {s.startTime}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <button onClick={submit} disabled={!startTime || submitting} className="btn-gold mt-6 w-full">
          {submitting ? 'Saving…' : 'Confirm new time'}
        </button>
      </div>
    </div>
  );
}

function ReviewModal({ booking, onClose, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.post('/reviews', { bookingId: booking._id, rating, comment });
      toast.success('Thanks for your review!');
      onDone();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="glass-panel w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg text-warmwhite">Rate your visit</h3>
          <button onClick={onClose} className="text-slate-soft hover:text-warmwhite"><X size={18} /></button>
        </div>
        <div className="flex justify-center">
          <StarRating value={rating} size={28} interactive onChange={setRating} />
        </div>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="How was your experience?" className="input-field mt-4" />
        <button onClick={submit} disabled={submitting} className="btn-gold mt-5 w-full">
          {submitting ? 'Submitting…' : 'Submit review'}
        </button>
      </div>
    </div>
  );
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get('/bookings/mine', { params: tab ? { status: tab } : {} })
      .then(({ data }) => setBookings(data.bookings))
      .catch(() => toast.error('Could not load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [tab]);

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="label-eyebrow">Your history</p>
      <h1 className="mt-1 font-display text-3xl text-warmwhite">My Bookings</h1>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${tab === t.key ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-slate-soft hover:border-white/25'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <Spinner label="Loading your bookings" />
        ) : bookings.length === 0 ? (
          <EmptyState title="No bookings here" message="Once you book an appointment, it'll show up in this list." />
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((b) => (
              <div key={b._id} className="glass-panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg text-warmwhite">{b.service?.name}</h3>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-soft"><MapPin size={12} /> {b.salon?.name}</p>
                    <p className="mt-1 flex items-center gap-4 text-xs text-slate-soft">
                      <span className="flex items-center gap-1"><CalendarDays size={12} /> {b.date}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {b.startTime}–{b.endTime}</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-soft">with {b.barber?.name}</p>
                  </div>
                  <span className="font-display text-lg text-gold">₹{b.priceAtBooking}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">
                  {b.paymentStatus === 'unpaid' && b.status === 'pending' && (
                    <a href={`/payment/${b._id}`} className="btn-gold !px-4 !py-2 text-xs">Pay now</a>
                  )}
                  {['pending', 'confirmed'].includes(b.status) && (
                    <>
                      <button onClick={() => setRescheduleTarget(b)} className="btn-outline !px-4 !py-2 text-xs"><RotateCcw size={12} /> Reschedule</button>
                      <button onClick={() => cancelBooking(b._id)} className="btn-outline !px-4 !py-2 text-xs !text-rose-400 hover:!border-rose-400/50"><X size={12} /> Cancel</button>
                    </>
                  )}
                  {b.status === 'completed' && !b.reviewed && (
                    <button onClick={() => setReviewTarget(b)} className="btn-outline !px-4 !py-2 text-xs"><Star size={12} /> Leave a review</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {rescheduleTarget && (
        <RescheduleModal booking={rescheduleTarget} onClose={() => setRescheduleTarget(null)} onDone={() => { setRescheduleTarget(null); load(); }} />
      )}
      {reviewTarget && (
        <ReviewModal booking={reviewTarget} onClose={() => setReviewTarget(null)} onDone={() => { setReviewTarget(null); load(); }} />
      )}
    </div>
  );
}
