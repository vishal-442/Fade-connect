import { NavLink } from 'react-router-dom';

export function DashboardLayout({ title, subtitle, links, children }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="label-eyebrow">{subtitle}</p>
        <h1 className="mt-1 font-display text-3xl text-warmwhite">{title}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="glass-panel h-fit p-3 lg:sticky lg:top-24">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive ? 'bg-gold/10 text-gold' : 'text-slate-soft hover:bg-white/5 hover:text-warmwhite'
                  }`
                }
              >
                <link.icon size={16} />
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
