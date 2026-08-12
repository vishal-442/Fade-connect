import { useEffect, useState } from 'react';
import { CalendarClock, Zap, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Spinner, EmptyState } from '../../components/ui/Primitives';
import { ownerNavLinks } from './ownerNav';
import { NoSalonPrompt } from './NoSalonPrompt';

const todayISO = () => new Date().toISOString().slice(0, 10);
const addDaysISO = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export default function SlotManagement() {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noSalon, setNoSalon] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [barberId, setBarberId] = useState('');
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(addDaysISO(6));
  const [granularity, setGranularity] = useState(30);
  const [clearDate, setClearDate] = useState(todayISO());

  useEffect(() => {
    api
      .get('/barbers/mine')
      .then(({ data }) => {
        setBarbers(data.barbers);
        if (data.barbers.length) setBarberId(data.barbers[0]._id);
      })
      .catch((err) => {
        if (err.message.includes('No salon')) setNoSalon(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const generate = async () => {
    if (!barberId) return toast.error('Add a barber first');
    setGenerating(true);
    try {
      const { data } = await api.post('/slots/generate', {
        barberId,
        startDate,
        endDate,
        granularityMinutes: Number(granularity),
      });
      toast.success(`Generated ${data.generated} slots`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const clearDay = async () => {
    if (!barberId) return;
    if (!window.confirm(`Clear all unbooked slots for this barber on ${clearDate}?`)) return;
    setClearing(true);
    try {
      const { data } = await api.delete('/slots', { params: { barberId, date: clearDate } });
      toast.success(`Removed ${data.deleted} open slots`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setClearing(false);
    }
  };

  return (
    <DashboardLayout title="Slots & Hours" subtitle="Owner Panel" links={ownerNavLinks}>
      {loading ? (
        <Spinner label="Loading" />
      ) : noSalon ? (
        <NoSalonPrompt />
      ) : barbers.length === 0 ? (
        <EmptyState title="Add a barber first" message="Slots are generated per barber, based on your salon's business hours." />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6">
            <h3 className="flex items-center gap-2 font-display text-lg text-warmwhite">
              <Zap size={16} className="text-gold" /> Generate available slots
            </h3>
            <p className="mt-1 text-xs text-slate-soft">
              Creates bookable time windows from your salon's business hours, skipping holidays and the barber's days off.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-slate-soft">Barber</span>
                <select value={barberId} onChange={(e) => setBarberId(e.target.value)} className="input-field">
                  {barbers.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-slate-soft">From</span>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-slate-soft">To</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-slate-soft">Slot length (min)</span>
                <select value={granularity} onChange={(e) => setGranularity(e.target.value)} className="input-field">
                  {[15, 20, 30, 45, 60].map((g) => <option key={g} value={g}>{g} min</option>)}
                </select>
              </label>
            </div>

            <button onClick={generate} disabled={generating} className="btn-gold mt-5">
              <CalendarClock size={15} /> {generating ? 'Generating…' : 'Generate slots'}
            </button>
          </div>

          <div className="glass-panel p-6">
            <h3 className="flex items-center gap-2 font-display text-lg text-warmwhite">
              <Trash2 size={16} className="text-gold" /> Clear open slots for a day
            </h3>
            <p className="mt-1 text-xs text-slate-soft">Only removes slots that haven't been booked yet.</p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-slate-soft">Date</span>
                <input type="date" value={clearDate} onChange={(e) => setClearDate(e.target.value)} className="input-field" />
              </label>
              <button onClick={clearDay} disabled={clearing} className="btn-outline !text-rose-400 hover:!border-rose-400/50">
                {clearing ? 'Clearing…' : 'Clear slots'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
