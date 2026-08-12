import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Spinner, EmptyState, StatusBadge } from '../../components/ui/Primitives';
import { adminNavLinks } from './adminNav';

const STATUSES = ['', 'pending', 'approved', 'rejected', 'blocked'];

export default function AdminSalons() {
  const [salons, setSalons] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/salons', { params: status ? { status } : {} }).then(({ data }) => setSalons(data.salons)).finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  const setSalonStatus = async (id, newStatus) => {
    try {
      await api.put(`/admin/salons/${id}/status`, { status: newStatus });
      toast.success(`Salon ${newStatus}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout title="Salons" subtitle="Admin Panel" links={adminNavLinks}>
      <div className="mb-5 flex gap-2 overflow-x-auto">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium capitalize ${status === s ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-slate-soft'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner label="Loading salons" />
      ) : salons.length === 0 ? (
        <EmptyState title="No salons found" />
      ) : (
        <div className="glass-panel divide-y divide-white/5 overflow-hidden">
          {salons.map((s) => (
            <div key={s._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium text-warmwhite">{s.name}</p>
                <p className="text-xs text-slate-soft">{s.location.city} · Owner: {s.owner?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={s.status} />
                {s.status !== 'approved' && (
                  <button onClick={() => setSalonStatus(s._id, 'approved')} className="btn-outline !px-3 !py-1.5 text-xs">Approve</button>
                )}
                {s.status !== 'rejected' && (
                  <button onClick={() => setSalonStatus(s._id, 'rejected')} className="btn-outline !px-3 !py-1.5 text-xs !text-rose-400 hover:!border-rose-400/50">Reject</button>
                )}
                {s.status !== 'blocked' && (
                  <button onClick={() => setSalonStatus(s._id, 'blocked')} className="btn-outline !px-3 !py-1.5 text-xs !text-rose-400 hover:!border-rose-400/50">Block</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
