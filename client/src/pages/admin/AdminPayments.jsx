import { useEffect, useState } from 'react';
import { CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Spinner, EmptyState, Badge } from '../../components/ui/Primitives';
import { adminNavLinks } from './adminNav';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/admin/payments', { params: { page: pagination.page } })
      .then(({ data }) => {
        setPayments(data.payments);
        setPagination(data.pagination);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  return (
    <DashboardLayout title="Payments" subtitle="Admin Panel" links={adminNavLinks}>
      {loading ? (
        <Spinner label="Loading payments" />
      ) : payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments yet" message="Paid bookings will show up here." />
      ) : (
        <div className="glass-panel overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/5 text-xs uppercase tracking-wide text-slate-soft">
              <tr>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Salon</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 text-warmwhite">{p.customer?.name}</td>
                  <td className="px-5 py-3 text-slate-soft">{p.salon?.name}</td>
                  <td className="px-5 py-3 text-gold">₹{p.amount}</td>
                  <td className="px-5 py-3">
                    <Badge tone={p.status === 'paid' ? 'green' : p.status === 'failed' ? 'red' : 'neutral'}>{p.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-soft">{p.invoiceNumber || '—'}</td>
                  <td className="px-5 py-3 text-slate-soft">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
            className="btn-outline !px-3 !py-2 disabled:opacity-30"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm text-slate-soft">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
            className="btn-outline !px-3 !py-2 disabled:opacity-30"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
