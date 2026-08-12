import { useEffect, useState } from 'react';
import { Plus, Trash2, Camera, Scissors, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Spinner, EmptyState, Badge } from '../../components/ui/Primitives';
import { ownerNavLinks } from './ownerNav';
import { NoSalonPrompt } from './NoSalonPrompt';

const ALL_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABEL = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };

const emptyForm = { name: '', bio: '', experienceYears: 0, specialties: '', workingDays: [...ALL_DAYS].slice(0, 6), services: [] };

export default function BarberManagement() {
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noSalon, setNoSalon] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    Promise.all([api.get('/barbers/mine'), api.get('/services/mine')])
      .then(([b, s]) => {
        setBarbers(b.data.barbers);
        setServices(s.data.services);
      })
      .catch((err) => {
        if (err.message.includes('No salon')) setNoSalon(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      workingDays: f.workingDays.includes(day) ? f.workingDays.filter((d) => d !== day) : [...f.workingDays, day],
    }));
  };

  const toggleService = (id) => {
    setForm((f) => ({
      ...f,
      services: f.services.includes(id) ? f.services.filter((s) => s !== id) : [...f.services, id],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/barbers', {
        ...form,
        specialties: form.specialties.split(',').map((s) => s.trim()).filter(Boolean),
        experienceYears: Number(form.experienceYears),
      });
      toast.success('Barber added');
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const removeBarber = async (id) => {
    if (!window.confirm('Remove this barber?')) return;
    try {
      await api.delete(`/barbers/${id}`);
      toast.success('Barber removed');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const uploadPhoto = async (id, file) => {
    const fd = new FormData();
    fd.append('photo', file);
    try {
      await api.put(`/barbers/${id}/photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Photo updated');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout title="Barbers" subtitle="Owner Panel" links={ownerNavLinks}>
      {loading ? (
        <Spinner label="Loading barbers" />
      ) : noSalon ? (
        <NoSalonPrompt />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex justify-end">
            <button onClick={() => setShowForm((s) => !s)} className="btn-gold !px-4 !py-2 text-sm">
              {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? 'Cancel' : 'Add barber'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={submit} className="glass-panel flex flex-col gap-4 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-slate-soft">Name</span>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-slate-soft">Experience (years)</span>
                  <input type="number" min={0} value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} className="input-field" />
                </label>
              </div>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-slate-soft">Bio</span>
                <textarea rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-field" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-slate-soft">Specialties (comma-separated)</span>
                <input value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} placeholder="Fades, Beard Styling" className="input-field" />
              </label>

              <div>
                <p className="mb-1.5 text-sm text-slate-soft">Working days</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map((d) => (
                    <button type="button" key={d} onClick={() => toggleDay(d)} className={`rounded-full border px-3 py-1.5 text-xs ${form.workingDays.includes(d) ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-slate-soft'}`}>
                      {DAY_LABEL[d]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-sm text-slate-soft">Assigned services</p>
                <div className="flex flex-wrap gap-2">
                  {services.map((s) => (
                    <button type="button" key={s._id} onClick={() => toggleService(s._id)} className={`rounded-full border px-3 py-1.5 text-xs ${form.services.includes(s._id) ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-slate-soft'}`}>
                      {s.name}
                    </button>
                  ))}
                  {services.length === 0 && <p className="text-xs text-slate-soft">Add services first to assign them.</p>}
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-gold mt-2 w-fit">
                {submitting ? 'Adding…' : 'Add barber'}
              </button>
            </form>
          )}

          {barbers.length === 0 ? (
            <EmptyState icon={Scissors} title="No barbers yet" message="Add your first barber to start accepting bookings." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {barbers.map((b) => (
                <div key={b._id} className="glass-panel p-5">
                  <div className="flex items-center gap-3">
                    <label className="relative cursor-pointer">
                      {b.photo?.url ? (
                        <img src={b.photo.url} alt="" className="h-14 w-14 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-charcoal text-gold"><Scissors size={18} /></span>
                      )}
                      <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-ink"><Camera size={11} /></span>
                      <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && uploadPhoto(b._id, e.target.files[0])} />
                    </label>
                    <div>
                      <p className="font-medium text-warmwhite">{b.name}</p>
                      <p className="text-xs text-slate-soft">{b.experienceYears} yrs experience</p>
                    </div>
                  </div>
                  {b.specialties?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {b.specialties.map((s) => <Badge key={s}>{s}</Badge>)}
                    </div>
                  )}
                  <button onClick={() => removeBarber(b._id)} className="btn-outline mt-4 w-full !py-2 text-xs !text-rose-400 hover:!border-rose-400/50">
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
