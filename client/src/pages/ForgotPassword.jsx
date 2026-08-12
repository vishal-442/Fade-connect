import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl text-warmwhite">Reset your password</h1>
        <p className="mt-1.5 text-sm text-slate-soft">We'll email you a secure reset link.</p>
      </div>

      {sent ? (
        <div className="glass-panel flex flex-col items-center gap-3 p-8 text-center">
          <MailCheck className="text-gold" size={28} />
          <p className="text-sm text-slate-soft">
            If an account exists for <span className="text-warmwhite">{email}</span>, a reset link is on its way.
          </p>
          <p className="text-xs text-slate-soft/70">
            (In dev mode, check the server console — emails are logged there instead of sent.)
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel flex flex-col gap-4 p-7">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-slate-soft">Email</span>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field pl-10"
              />
            </div>
          </label>
          <button type="submit" disabled={loading} className="btn-gold mt-2 w-full">
            {loading ? 'Sending…' : 'Send reset link'} <ArrowRight size={15} />
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-soft">
        <Link to="/login" className="font-medium text-gold hover:text-gold-glow">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
