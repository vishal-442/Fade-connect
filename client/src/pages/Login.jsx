import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Scissors, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const from = location.state?.from;
      if (from) navigate(from);
      else if (user.role === 'owner') navigate('/owner/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/salons');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
          <Scissors size={22} />
        </span>
        <h1 className="mt-4 font-display text-3xl text-warmwhite">Welcome back</h1>
        <p className="mt-1.5 text-sm text-slate-soft">Log in to book your next appointment.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel flex flex-col gap-4 p-7">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-soft">Email</span>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="input-field pl-10"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-soft">Password</span>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-field pl-10"
            />
          </div>
        </label>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-slate-soft hover:text-gold transition-colors">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn-gold mt-2 w-full">
          {loading ? 'Logging in…' : 'Log In'} <ArrowRight size={15} />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-soft">
        New to Fade Connect?{' '}
        <Link to="/register" className="font-medium text-gold hover:text-gold-glow">
          Create an account
        </Link>
      </p>

      <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-slate-soft">
        <p className="mb-1.5 font-medium text-slate-soft/90">Demo accounts (after running the seed script):</p>
        <p>Customer — customer1@fadeconnect.app / customer123</p>
        <p>Owner — owner1@fadeconnect.app / owner123</p>
        <p>Admin — admin@fadeconnect.app / admin123</p>
      </div>
    </div>
  );
}
