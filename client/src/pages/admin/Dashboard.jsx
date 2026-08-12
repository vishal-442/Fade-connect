import { useEffect, useState } from 'react';
import { Users, Store, CalendarCheck, IndianRupee, ClipboardList, MessageSquareWarning } from 'lucide-react';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Spinner } from '../../components/ui/Primitives';
import { adminNavLinks } from './adminNav';

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-2 text-slate-soft">
        <Icon size={15} className="text-gold" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl text-warmwhite">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/summary').then(({ data }) => setSummary(data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Dashboard" subtitle="Admin Panel" links={adminNavLinks}>
      {loading ? (
        <Spinner label="Loading platform stats" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={Users} label="Customers" value={summary.users} />
          <StatCard icon={Store} label="Salons" value={summary.salons} />
          <StatCard icon={ClipboardList} label="Pending Approvals" value={summary.pendingSalons} />
          <StatCard icon={CalendarCheck} label="Total Bookings" value={summary.bookings} />
          <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${summary.totalRevenue}`} />
          <StatCard icon={MessageSquareWarning} label="Reported Reviews" value={summary.reportedReviews} />
        </div>
      )}
    </DashboardLayout>
  );
}
