import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Scissors, Bell, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const customerLinks = [
  { to: '/salons', label: 'Find Salons' },
  { to: '/ai-hairstyle', label: 'AI Hairstyle' },
  { to: '/bookings', label: 'My Bookings' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const dashboardPath = user?.role === 'owner' ? '/owner/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-lg tracking-wide text-warmwhite">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-gold">
            <Scissors size={16} />
          </span>
          Fade Connect
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {(!user || user.role === 'customer') &&
            customerLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-gold' : 'text-slate-soft hover:text-warmwhite'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          {dashboardPath && (
            <NavLink
              to={dashboardPath}
              className={({ isActive }) =>
                `flex items-center gap-1.5 text-sm font-medium transition-colors ${isActive ? 'text-gold' : 'text-slate-soft hover:text-warmwhite'}`
              }
            >
              <LayoutDashboard size={15} /> Dashboard
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              {user.role === 'customer' && (
                <Link to="/notifications" className="text-slate-soft hover:text-gold transition-colors">
                  <Bell size={19} />
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-2 text-sm text-warmwhite hover:text-gold transition-colors">
                {user.avatar?.url ? (
                  <img src={user.avatar.url} alt="" className="h-8 w-8 rounded-full object-cover border border-gold/30" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-charcoal text-gold">
                    <UserIcon size={15} />
                  </span>
                )}
                {user.name.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="text-slate-soft hover:text-gold transition-colors" title="Log out">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-soft hover:text-warmwhite transition-colors">
                Log in
              </Link>
              <Link to="/register" className="btn-gold !px-5 !py-2 text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button className="text-warmwhite md:hidden" onClick={() => setOpen((o) => !o)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-ink px-4 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-3">
            {(!user || user.role === 'customer') &&
              customerLinks.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm text-slate-soft hover:text-gold">
                  {l.label}
                </Link>
              ))}
            {dashboardPath && (
              <Link to={dashboardPath} onClick={() => setOpen(false)} className="text-sm text-slate-soft hover:text-gold">
                Dashboard
              </Link>
            )}
            {user ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className="text-sm text-slate-soft hover:text-gold">
                  Profile
                </Link>
                <button onClick={handleLogout} className="text-left text-sm text-slate-soft hover:text-gold">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-sm text-slate-soft hover:text-gold">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-gold w-fit !px-5 !py-2 text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
