import { Loader2 } from 'lucide-react';

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-soft">
      <Loader2 className="h-6 w-6 animate-spin text-gold" />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="glass-panel flex flex-col items-center gap-3 px-8 py-14 text-center">
      {Icon && <Icon className="h-9 w-9 text-gold/70" strokeWidth={1.5} />}
      <h3 className="font-display text-xl text-warmwhite">{title}</h3>
      {message && <p className="max-w-sm text-sm text-slate-soft">{message}</p>}
      {action}
    </div>
  );
}

export function Badge({ tone = 'neutral', children }) {
  const tones = {
    neutral: 'bg-white/5 text-slate-soft border-white/10',
    gold: 'bg-gold/10 text-gold border-gold/30',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    blue: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pending: { tone: 'gold', label: 'Pending' },
    confirmed: { tone: 'green', label: 'Confirmed' },
    rejected: { tone: 'red', label: 'Rejected' },
    completed: { tone: 'blue', label: 'Completed' },
    cancelled: { tone: 'red', label: 'Cancelled' },
    rescheduled: { tone: 'neutral', label: 'Rescheduled' },
    approved: { tone: 'green', label: 'Approved' },
    blocked: { tone: 'red', label: 'Blocked' },
  };
  const cfg = map[status] || { tone: 'neutral', label: status };
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}
