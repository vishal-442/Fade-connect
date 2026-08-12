import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Plus, Ticket } from 'lucide-react';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Spinner, EmptyState, Badge } from '../../components/ui/Primitives';
import { adminNavLinks } from './adminNav';

const emptyCoupon = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minBookingAmount: '',
  expiresAt: '',
  usageLimit: 100,
};

export default function AdminSettings() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyCoupon);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/admin/coupons').then(({ data }) => setCoupons(data.coupons)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/coupons', {
        ...form,
        discountValue: Number(form.discountValue),
        minBookingAmount: Number(form.minBookingAmount || 0),
        usageLimit: Number(form.usageLimit || 100),
      });
      toast.success('Coupon created');
      setForm(emptyCoupon);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id) => {
    try {
      await api.put(`/admin/coupons/${id}/toggle`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout title="Settings" subtitle="Admin Panel" links={adminNavLinks}>
      <div className="mb-8 glass-panel p-5">
        <div className="flex items-center gap-2 text-warmwhite">
          <SettingsIcon size={16} className="text-gold" />
          <h3 className="font-display text-lg">Platform settings</h3>
        </div>
        <p className="mt-2 text-sm text-slate-soft">
          General platform configuration (booking buffer, currency, support contact, etc.) lives here in a full
          build. This preview focuses on coupon management below.
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-lg text-warmwhite">
          <Ticket size={16} className="text-gold" /> Coupons
        </h3>
        <button onClick={() => setShowForm((s) => !s)} className="btn-gold !px-4 !py-2 text-xs">
          <Plus size={14} /> New coupon
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="glass-panel mb-6 grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <input required placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field" />
          <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="input-field">
            <option value="percentage">Percentage off</option>
            <option value="flat">Flat amount off</option>
          </select>
          <input required type="number" placeholder="Discount value" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="input-field" />
          <input type="number" placeholder="Min booking amount" value={form.minBookingAmount} onChange={(e) => setForm({ ...form, minBookingAmount: e.target.value })} className="input-field" />
          <input required type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="input-field" />
          <input type="number" placeholder="Usage limit" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="input-field" />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field sm:col-span-2" />
          <button disabled={saving} className="btn-gold sm:col-span-2">
            {saving ? 'Creating…' : 'Create coupon'}
          </button>
        </form>
      )}

      {loading ? (
        <Spinner label="Loading coupons" />
      ) : coupons.length === 0 ? (
        <EmptyState icon={Ticket} title="No coupons yet" message="Create your first coupon above." />
      ) : (
        <div className="space-y-3">
          {coupons.map((c) => (
            <div key={c._id} className="glass-panel flex items-center justify-between p-4">
              <div>
                <p className="font-display text-warmwhite">{c.code}</p>
                <p className="text-xs text-slate-soft">
                  {c.discountType === 'percentage' ? `${c.discountValue}% off` : `₹${c.discountValue} off`} · used {c.usedCount}/{c.usageLimit} · expires{' '}
                  {new Date(c.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={c.isActive ? 'green' : 'neutral'}>{c.isActive ? 'Active' : 'Disabled'}</Badge>
                <button onClick={() => toggle(c._id)} className="btn-outline !px-3 !py-1.5 text-xs">
                  {c.isActive ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
