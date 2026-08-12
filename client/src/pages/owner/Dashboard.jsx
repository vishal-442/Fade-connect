import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CalendarCheck, TrendingUp, IndianRupee, Users } from 'lucide-react';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Spinner } from '../../components/ui/Primitives';
import { ownerNavLinks } from './ownerNav';
import { NoSalonPrompt } from './NoSalonPrompt';

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-2 text-slate-soft">
        <Icon size={15} className="text-gold" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl text-warmwhite">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-soft">{sub}</p>}
    </div>
  );
}

export default function OwnerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noSalon, setNoSalon] = useState(false);

  useEffect(() => {
    api
      .get('/dashboard/owner')
      .then(({ data }) => setStats(data))
      .catch((err) => {
        if (err.message.includes('No salon')) setNoSalon(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Dashboard" subtitle="Owner Panel" links={ownerNavLinks}>
      {loading ? (
        <Spinner label="Loading your dashboard" />
      ) : noSalon ? (
        <NoSalonPrompt />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={CalendarCheck} label="Today's Bookings" value={stats.todayBookings} />
            <StatCard icon={TrendingUp} label="Weekly Bookings" value={stats.weeklyBookings} sub="last 7 days" />
            <StatCard icon={IndianRupee} label="Monthly Revenue" value={`₹${stats.monthlyRevenue}`} sub={`${stats.monthlyPaidCount} paid orders`} />
            <StatCard icon={Users} label="Salon Status" value={stats.salonStatus} sub={stats.salonStatus === 'pending' ? 'Awaiting admin approval' : ''} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="glass-panel p-6">
              <h3 className="font-display text-lg text-warmwhite">Popular services</h3>
              <div className="mt-4 h-56">
                {stats.popularServices.length === 0 ? (
                  <p className="text-sm text-slate-soft">No confirmed bookings yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.popularServices} layout="vertical" margin={{ left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                      <XAxis type="number" stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={11} width={110} />
                      <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 10, fontSize: 12 }} />
                      <Bar dataKey="count" fill="#D4AF37" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="glass-panel p-6">
              <h3 className="font-display text-lg text-warmwhite">Peak hours</h3>
              <div className="mt-4 h-56">
                {stats.peakHours.length === 0 ? (
                  <p className="text-sm text-slate-soft">No booking data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.peakHours}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="_id" stroke="#94A3B8" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 10, fontSize: 12 }} />
                      <Bar dataKey="count" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="font-display text-lg text-warmwhite">Top customers</h3>
            {stats.topCustomers.length === 0 ? (
              <p className="mt-3 text-sm text-slate-soft">No customer data yet.</p>
            ) : (
              <div className="mt-4 divide-y divide-white/5">
                {stats.topCustomers.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-3 text-sm">
                    <span className="text-warmwhite">{c.name}</span>
                    <span className="text-slate-soft">{c.visits} visits · ₹{c.spend} spent</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
