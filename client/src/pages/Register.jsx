import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, User, Mail, Lock, Phone, ArrowRight, Store, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register({ ...form, role });
      toast.success('Account created — welcome to Fade Connect!');
      if (user.role === 'owner') navigate('/owner/salon-setup');
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
        <h1 className="mt-4 font-display text-3xl text-warmwhite">Create your account</h1>
        <p className="mt-1.5 text-sm text-slate-soft">Book appointments or list your salon.</p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole('customer')}
          className={`glass-panel flex flex-col items-center gap-1.5 p-4 transition-colors ${
            role === 'customer' ? 'border-gold/50 text-gold' : 'text-slate-soft'
          }`}
        >
          <UserCircle size={20} />
          <span className="text-sm font-medium">I'm a Customer</span>
        </button>
        <button
          type="button"
          onClick={() => setRole('owner')}
          className={`glass-panel flex flex-col items-center gap-1.5 p-4 transition-colors ${
            role === 'owner' ? 'border-gold/50 text-gold' : 'text-slate-soft'
          }`}
        >
          <Store size={20} />
          <span className="text-sm font-medium">I own a Salon</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel flex flex-col gap-4 p-7">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-soft">Full name</span>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
            <input name="name" required value={form.name} onChange={handleChange} placeholder="Rohan Sharma" className="input-field pl-10" />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-soft">Email</span>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
            <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" className="input-field pl-10" />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-slate-soft">Phone</span>
          <div className="relative">
            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="98765 43210" className="input-field pl-10" />
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
              minLength={6}
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              className="input-field pl-10"
            />
          </div>
        </label>

        <button type="submit" disabled={loading} className="btn-gold mt-2 w-full">
          {loading ? 'Creating account…' : 'Create Account'} <ArrowRight size={15} />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-soft">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-gold hover:text-gold-glow">
          Log in
        </Link>
      </p>
    </div>
  );
}
