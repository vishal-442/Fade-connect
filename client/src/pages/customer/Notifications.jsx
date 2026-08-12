import { useEffect, useState } from 'react';
import { Bell, CalendarCheck, CreditCard, XCircle, MessageSquare, CheckCheck } from 'lucide-react';
import api from '../../api/axios';
import { Spinner, EmptyState } from '../../components/ui/Primitives';

const ICONS = {
  booking_confirmation: CalendarCheck,
  booking_reminder: CalendarCheck,
  payment_confirmation: CreditCard,
  cancellation: XCircle,
  booking_request: MessageSquare,
  general: Bell,
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/notifications')
      .then(({ data }) => setNotifications(data.notifications))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    load();
  };

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    load();
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-eyebrow">Stay updated</p>
          <h1 className="mt-1 font-display text-3xl text-warmwhite">Notifications</h1>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button onClick={markAllRead} className="btn-outline !px-3 !py-2 text-xs"><CheckCheck size={13} /> Mark all read</button>
        )}
      </div>

      <div className="mt-8">
        {loading ? (
          <Spinner label="Loading notifications" />
        ) : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="You're all caught up" message="Booking updates and reminders will show up here." />
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((n) => {
              const Icon = ICONS[n.type] || Bell;
              return (
                <button
                  key={n._id}
                  onClick={() => !n.isRead && markRead(n._id)}
                  className={`glass-panel flex items-start gap-3 p-4 text-left transition-colors ${!n.isRead ? 'border-gold/30' : 'opacity-70'}`}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <Icon size={15} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-warmwhite">{n.title}</p>
                    <p className="mt-0.5 text-xs text-slate-soft">{n.message}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-slate-soft/70">{timeAgo(n.createdAt)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
