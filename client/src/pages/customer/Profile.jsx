import { useRef, useState } from 'react';
import { Camera, User, Phone, Mail, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      setUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await api.put('/auth/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser(data.user);
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8">
      <p className="label-eyebrow">Account</p>
      <h1 className="mt-1 font-display text-3xl text-warmwhite">My Profile</h1>

      <div className="glass-panel mt-8 flex flex-col items-center gap-4 p-8">
        <div className="relative">
          {user.avatar?.url ? (
            <img src={user.avatar.url} alt="" className="h-24 w-24 rounded-full border-2 border-gold/40 object-cover" />
          ) : (
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-charcoal text-3xl font-display text-gold">
              {user.name[0]}
            </span>
          )}
          <button
            onClick={() => fileRef.current.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-gold text-ink shadow-gold"
          >
            <Camera size={14} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
        </div>
        <div className="text-center">
          <p className="font-display text-lg text-warmwhite">{user.name}</p>
          <p className="text-xs uppercase tracking-wide text-gold/80">{user.role}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass-panel mt-6 flex flex-col gap-4 p-7">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-soft">Full name</span>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field pl-10" />
          </div>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-soft">Phone</span>
          <div className="relative">
            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field pl-10" />
          </div>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-soft">Email</span>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
            <input value={user.email} disabled className="input-field pl-10 opacity-60" />
          </div>
        </label>
        <button type="submit" disabled={saving} className="btn-gold mt-2 w-full">
          <Save size={15} /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
