import { useEffect, useState } from 'react';
import { Plus, Trash2, Clock, IndianRupee, X, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Spinner, EmptyState } from '../../components/ui/Primitives';
import { ownerNavLinks } from './ownerNav';
import { NoSalonPrompt } from './NoSalonPrompt';

const CATEGORIES = ['Hair Cut', 'Beard Trim', 'Hair Spa', 'Hair Coloring', 'Facial', 'Shaving', 'Other'];
const emptyForm = { name: '', description: '', category: 'Hair Cut', price: '', durationMinutes: '' };

export default function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noSalon, setNoSalon] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api
      .get('/services/mine')
      .then(({ data }) => setServices(data.services))
      .catch((err) => {
        if (err.message.includes('No salon')) setNoSalon(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startEdit = (s) => {
    setEditingId(s._id);
    setForm({ name: s.name, description: s.description, category: s.category, price: s.price, durationMinutes: s.durationMinutes });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { ...form, price: Number(form.price), durationMinutes: Number(form.durationMinutes) };
    try {
      if (editingId) {
        await api.put(`/services/${editingId}`, payload);
        toast.success('Service updated');
      } else {
        await api.post('/services', payload);
        toast.success('Service added');
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const removeService = async (id) => {
    if (!window.confirm('Remove this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Service removed');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout title="Services" subtitle="Owner Panel" links={ownerNavLinks}>
      {loading ? (
        <Spinner label="Loading services" />
      ) : noSalon ? (
        <NoSalonPrompt />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex justify-end">
            <button onClick={() => (showForm ? resetForm() : setShowForm(true))} className="btn-gold !px-4 !py-2 text-sm">
              {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? 'Cancel' : 'Add service'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={submit} className="glass-panel flex flex-col gap-4 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-slate-soft">Service name</span>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-slate-soft">Category</span>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-slate-soft">Price (₹)</span>
                  <input required type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-slate-soft">Duration (minutes)</span>
                  <input required type="number" min={5} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} className="input-field" />
                </label>
              </div>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-slate-soft">Description</span>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
              </label>
              <button type="submit" disabled={submitting} className="btn-gold mt-2 w-fit">
                {submitting ? 'Saving…' : editingId ? 'Update service' : 'Add service'}
              </button>
            </form>
          )}

          {services.length === 0 ? (
            <EmptyState title="No services yet" message="Add the services your salon offers so customers can book them." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {services.map((s) => (
                <div key={s._id} className="glass-panel flex items-center justify-between gap-4 p-5">
                  <div>
                    <h4 className="font-display text-base text-warmwhite">{s.name}</h4>
                    <p className="mt-1 text-xs text-slate-soft">{s.category}</p>
                    <p className="mt-2 flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-gold font-medium"><IndianRupee size={12} />{s.price}</span>
                      <span className="flex items-center gap-1 text-slate-soft"><Clock size={12} />{s.durationMinutes} min</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <button onClick={() => startEdit(s)} className="btn-outline !px-3 !py-1.5 text-xs"><Edit2 size={11} /></button>
                    <button onClick={() => removeService(s._id)} className="btn-outline !px-3 !py-1.5 text-xs !text-rose-400 hover:!border-rose-400/50"><Trash2 size={11} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
