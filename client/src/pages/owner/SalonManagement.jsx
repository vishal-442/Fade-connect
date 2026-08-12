import { useEffect, useRef, useState } from 'react';
import { Upload, Save, CalendarX, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Spinner, Badge } from '../../components/ui/Primitives';
import { ownerNavLinks } from './ownerNav';
import { NoSalonPrompt } from './NoSalonPrompt';

const DAY_LABEL = { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' };

export default function SalonManagement() {
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noSalon, setNoSalon] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newHoliday, setNewHoliday] = useState('');
  const fileRef = useRef();

  const load = () => {
    api
      .get('/salons/mine/profile')
      .then(({ data }) => setSalon(data.salon))
      .catch((err) => {
        if (err.message.includes('No salon')) setNoSalon(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/salons/mine/profile', {
        name: salon.name,
        description: salon.description,
        location: salon.location,
        contact: salon.contact,
        businessHours: salon.businessHours,
        priceLevel: salon.priceLevel,
      });
      setSalon(data.salon);
      toast.success('Salon profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const fd = new FormData();
    files.forEach((f) => fd.append('images', f));
    try {
      const { data } = await api.post('/salons/mine/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSalon((s) => ({ ...s, images: data.images }));
      toast.success('Images uploaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleHoliday = async (date, action) => {
    try {
      const { data } = await api.put('/salons/mine/blocked-dates', { date, action });
      setSalon((s) => ({ ...s, blockedDates: data.blockedDates }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const updateHour = (day, field, value) => {
    setSalon((s) => ({
      ...s,
      businessHours: s.businessHours.map((h) => (h.day === day ? { ...h, [field]: value } : h)),
    }));
  };

  return (
    <DashboardLayout title="Salon Profile" subtitle="Owner Panel" links={ownerNavLinks}>
      {loading ? (
        <Spinner label="Loading salon" />
      ) : noSalon ? (
        <NoSalonPrompt />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Gallery */}
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-warmwhite">Gallery</h3>
              <button onClick={() => fileRef.current.click()} disabled={uploading} className="btn-outline !px-4 !py-2 text-xs">
                <Upload size={13} /> {uploading ? 'Uploading…' : 'Upload images'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={uploadImages} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {salon.images.map((img, i) => (
                <img key={i} src={img.url} alt="" className="h-24 w-full rounded-lg object-cover" />
              ))}
              {salon.images.length === 0 && <p className="text-sm text-slate-soft">No images uploaded yet.</p>}
            </div>
          </div>

          {/* Profile form */}
          <form onSubmit={save} className="glass-panel flex flex-col gap-4 p-6">
            <h3 className="font-display text-lg text-warmwhite">Details</h3>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-slate-soft">Salon name</span>
              <input value={salon.name} onChange={(e) => setSalon({ ...salon, name: e.target.value })} className="input-field" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-slate-soft">Description</span>
              <textarea rows={3} value={salon.description} onChange={(e) => setSalon({ ...salon, description: e.target.value })} className="input-field" />
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-slate-soft">Address</span>
                <input value={salon.location.address} onChange={(e) => setSalon({ ...salon, location: { ...salon.location, address: e.target.value } })} className="input-field" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-slate-soft">City</span>
                <input value={salon.location.city} onChange={(e) => setSalon({ ...salon, location: { ...salon.location, city: e.target.value } })} className="input-field" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-slate-soft">Phone</span>
                <input value={salon.contact?.phone || ''} onChange={(e) => setSalon({ ...salon, contact: { ...salon.contact, phone: e.target.value } })} className="input-field" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-slate-soft">Email</span>
                <input value={salon.contact?.email || ''} onChange={(e) => setSalon({ ...salon, contact: { ...salon.contact, email: e.target.value } })} className="input-field" />
              </label>
            </div>
            <button type="submit" disabled={saving} className="btn-gold mt-2 w-fit">
              <Save size={15} /> {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>

          {/* Business hours */}
          <div className="glass-panel p-6">
            <h3 className="font-display text-lg text-warmwhite">Business hours</h3>
            <div className="mt-4 flex flex-col gap-2">
              {salon.businessHours.map((h) => (
                <div key={h.day} className="flex flex-wrap items-center gap-3 text-sm">
                  <label className="flex w-16 items-center gap-2">
                    <input type="checkbox" checked={h.isOpen} onChange={(e) => updateHour(h.day, 'isOpen', e.target.checked)} className="accent-gold" />
                    {DAY_LABEL[h.day]}
                  </label>
                  {h.isOpen && (
                    <>
                      <input type="time" value={h.open} onChange={(e) => updateHour(h.day, 'open', e.target.value)} className="input-field !w-auto !py-1.5" />
                      <span className="text-slate-soft">to</span>
                      <input type="time" value={h.close} onChange={(e) => updateHour(h.day, 'close', e.target.value)} className="input-field !w-auto !py-1.5" />
                    </>
                  )}
                </div>
              ))}
            </div>
            <button onClick={save} disabled={saving} className="btn-outline mt-4 !px-4 !py-2 text-xs">Save hours</button>
          </div>

          {/* Holidays */}
          <div className="glass-panel p-6">
            <h3 className="flex items-center gap-2 font-display text-lg text-warmwhite"><CalendarX size={16} className="text-gold" /> Holidays / blocked dates</h3>
            <div className="mt-4 flex gap-2">
              <input type="date" value={newHoliday} onChange={(e) => setNewHoliday(e.target.value)} className="input-field !w-auto" />
              <button onClick={() => newHoliday && toggleHoliday(newHoliday, 'add')} className="btn-outline !px-4 !py-2 text-xs"><Plus size={13} /> Add</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {salon.blockedDates.length === 0 && <p className="text-sm text-slate-soft">No holidays scheduled.</p>}
              {salon.blockedDates.map((d) => {
                const iso = new Date(d).toISOString().slice(0, 10);
                return (
                  <button key={iso} onClick={() => toggleHoliday(iso, 'remove')} title="Click to remove">
                    <Badge tone="gold">{iso} ×</Badge>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
