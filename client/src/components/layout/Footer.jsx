import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2 font-display text-warmwhite">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 text-gold">
              <Scissors size={14} />
            </span>
            Fade Connect
          </div>
          <p className="text-center text-xs text-slate-soft">
            © {new Date().getFullYear()} Fade Connect. Skip the wait, book the chair.
          </p>
          <div className="flex gap-5 text-xs text-slate-soft">
            <Link to="/salons" className="hover:text-gold transition-colors">Find Salons</Link>
            <Link to="/register" className="hover:text-gold transition-colors">List Your Salon</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
