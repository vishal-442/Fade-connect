import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ResetPassword() {
  const { token } = useParams();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { password });
      localStorage.setItem('fc_token', data.token);
      const me = await api.get('/auth/me');
      setUser(me.data.user);
      toast.success('Password reset successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl text-warmwhite">Set a new password</h1>
        <p className="mt-1.5 text-sm text-slate-soft">Choose something you haven't used before.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel flex flex-col gap-4 p-7">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-soft">New password</span>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="input-field pl-10"
            />
          </div>
        </label>
        <button type="submit" disabled={loading} className="btn-gold mt-2 w-full">
          {loading ? 'Saving…' : 'Reset password'} <ArrowRight size={15} />
        </button>
      </form>
    </div>
  );
}
