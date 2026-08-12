import { useEffect, useState } from 'react';
import { Ban, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Spinner, EmptyState, Badge } from '../../components/ui/Primitives';
import { adminNavLinks } from './adminNav';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/users', { params: role ? { role } : {} }).then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  };

  useEffect(load, [role]);

  const toggleBlock = async (id) => {
    try {
      await api.put(`/admin/users/${id}/block`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout title="Users" subtitle="Admin Panel" links={adminNavLinks}>
      <div className="mb-5 flex gap-2">
        {['', 'customer', 'owner', 'admin'].map((r) => (
          <button key={r} onClick={() => setRole(r)} className={`rounded-full border px-4 py-1.5 text-xs font-medium ${role === r ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-slate-soft'}`}>
            {r || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner label="Loading users" />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="glass-panel divide-y divide-white/5 overflow-hidden">
          {users.map((u) => (
            <div key={u._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium text-warmwhite">{u.name}</p>
                <p className="text-xs text-slate-soft">{u.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{u.role}</Badge>
                {u.isBlocked && <Badge tone="red">Blocked</Badge>}
                <button onClick={() => toggleBlock(u._id)} className={`btn-outline !px-3 !py-1.5 text-xs ${u.isBlocked ? '' : '!text-rose-400 hover:!border-rose-400/50'}`}>
                  {u.isBlocked ? <><CheckCircle size={11} /> Unblock</> : <><Ban size={11} /> Block</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
