import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

export default function SalonSetup() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    lat: '17.3850',
    lng: '78.4867',
    phone: '',
    email: '',
    priceLevel: 2,
  });
  const [hours, setHours] = useState(
    DAYS.map((d) => ({ day: d.key, isOpen: d.key !== 'sun', open: '09:00', close: '20:00' }))
  );

  const updateHour = (day, field, value) => {
    setHours((prev) => prev.map((h) => (h.day === day ? { ...h, [field]: value } : h)));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/salons', {
        name: form.name,
        description: form.description,
        priceLevel: Number(form.priceLevel),
        location: {
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          lat: Number(form.lat),
          lng: Number(form.lng),
        },
        contact: { phone: form.phone, email: form.email },
        businessHours: hours,
      });
      toast.success('Salon registered! It will appear once approved by our team.');
      navigate('/owner/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
          <Store size={22} />
        </span>
        <h1 className="mt-4 font-display text-3xl text-warmwhite">Set up your salon</h1>
        <p className="mt-1.5 text-sm text-slate-soft">Tell customers who you are — you can edit this anytime.</p>
      </div>

      <form onSubmit={submit} className="glass-panel mt-8 flex flex-col gap-5 p-7">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-soft">Salon name</span>
          <div className="relative">
            <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="The Gentlemen's Parlour" className="input-field pl-10" />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-soft">Description</span>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What makes your salon special?" className="input-field" />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-soft">Address</span>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
              <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field pl-10" />
            </div>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-soft">City</span>
            <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-soft">State</span>
            <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-field" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-soft">Pincode</span>
            <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="input-field" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-soft">Latitude</span>
            <input required value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} className="input-field" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-soft">Longitude</span>
            <input required value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} className="input-field" />
          </label>
        </div>
        <p className="-mt-2 text-[11px] text-slate-soft/70">
          Latitude/longitude power map placement (Google Maps API). Look up your address on Google Maps and copy the coordinates from the URL.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-soft">Contact phone</span>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field pl-10" />
            </div>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-soft">Contact email</span>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-10" />
            </div>
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-soft">Price level</span>
          <select value={form.priceLevel} onChange={(e) => setForm({ ...form, priceLevel: e.target.value })} className="input-field">
            <option value={1}>₹ Budget</option>
            <option value={2}>₹₹ Moderate</option>
            <option value={3}>₹₹₹ Premium</option>
            <option value={4}>₹₹₹₹ Luxury</option>
          </select>
        </label>

        <div>
          <p className="mb-2 text-sm text-slate-soft">Business hours</p>
          <div className="flex flex-col gap-2 rounded-xl border border-white/10 p-3">
            {DAYS.map((d) => {
              const h = hours.find((x) => x.day === d.key);
              return (
                <div key={d.key} className="flex flex-wrap items-center gap-3 text-sm">
                  <label className="flex w-28 items-center gap-2">
                    <input type="checkbox" checked={h.isOpen} onChange={(e) => updateHour(d.key, 'isOpen', e.target.checked)} className="accent-gold" />
                    {d.label}
                  </label>
                  {h.isOpen && (
                    <>
                      <input type="time" value={h.open} onChange={(e) => updateHour(d.key, 'open', e.target.value)} className="input-field !w-auto !py-1.5" />
                      <span className="text-slate-soft">to</span>
                      <input type="time" value={h.close} onChange={(e) => updateHour(d.key, 'close', e.target.value)} className="input-field !w-auto !py-1.5" />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-gold mt-2 w-full">
          {submitting ? 'Creating…' : 'Register my salon'} <ArrowRight size={15} />
        </button>
      </form>
    </div>
  );
}
