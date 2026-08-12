import { useEffect, useState } from 'react';
import { CalendarDays, Clock, Phone, Check, X, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Spinner, EmptyState, StatusBadge } from '../../components/ui/Primitives';
import { ownerNavLinks } from './ownerNav';
import { NoSalonPrompt } from './NoSalonPrompt';

const FILTERS = [
  { key: 'today', label: "Today" },
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
];

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('today');
  const [loading, setLoading] = useState(true);
  const [noSalon, setNoSalon] = useState(false);
  const [actingId, setActingId] = useState(null);

  const load = () => {
    setLoading(true);
    const req = filter === 'today' ? api.get('/bookings/salon/today') : api.get('/bookings/salon', { params: filter ? { status: filter } : {} });
    req
      .then(({ data }) => setBookings(data.bookings))
      .catch((err) => {
        if (err.message.includes('No salon')) setNoSalon(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const act = async (id, status, reason) => {
    setActingId(id);
    try {
      await api.put(`/bookings/${id}/status`, { status, reason });
      toast.success(`Booking ${status}`);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActingId(null);
    }
  };

  return (
    <DashboardLayout title="Bookings" subtitle="Owner Panel" links={ownerNavLinks}>
      {noSalon ? (
        <NoSalonPrompt />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)} className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${filter === f.key ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-slate-soft hover:border-white/25'}`}>
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <Spinner label="Loading bookings" />
          ) : bookings.length === 0 ? (
            <EmptyState title="No bookings here" message="Bookings from customers will show up in this list." />
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
                      <p className="mt-1 text-sm text-warmwhite">{b.customer?.name}</p>
                      {b.customer?.phone && <p className="flex items-center gap-1 text-xs text-slate-soft"><Phone size={11} /> {b.customer.phone}</p>}
                      <p className="mt-1 flex items-center gap-4 text-xs text-slate-soft">
                        <span className="flex items-center gap-1"><CalendarDays size={12} /> {b.date}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {b.startTime}</span>
                        <span>with {b.barber?.name}</span>
                      </p>
                      {b.notes && <p className="mt-2 text-xs italic text-slate-soft">"{b.notes}"</p>}
                    </div>
                    <span className="font-display text-lg text-gold">₹{b.priceAtBooking}</span>
                  </div>

                  {b.status === 'pending' && (
                    <div className="mt-4 flex gap-2 border-t border-white/5 pt-4">
                      <button disabled={actingId === b._id} onClick={() => act(b._id, 'confirmed')} className="btn-gold !px-4 !py-2 text-xs">
                        <Check size={12} /> Accept
                      </button>
                      <button disabled={actingId === b._id} onClick={() => act(b._id, 'rejected', 'Not available')} className="btn-outline !px-4 !py-2 text-xs !text-rose-400 hover:!border-rose-400/50">
                        <X size={12} /> Reject
                      </button>
                    </div>
                  )}
                  {b.status === 'confirmed' && (
                    <div className="mt-4 flex gap-2 border-t border-white/5 pt-4">
                      <button disabled={actingId === b._id} onClick={() => act(b._id, 'completed')} className="btn-outline !px-4 !py-2 text-xs">
                        <CheckCheck size={12} /> Mark completed
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
