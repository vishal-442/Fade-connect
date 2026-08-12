import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MessageSquareWarning } from 'lucide-react';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Spinner, EmptyState, Badge } from '../../components/ui/Primitives';
import { adminNavLinks } from './adminNav';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [reportedOnly, setReportedOnly] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/admin/reviews', { params: reportedOnly ? { reported: 'true' } : {} })
      .then(({ data }) => setReviews(data.reviews))
      .finally(() => setLoading(false));
  };

  useEffect(load, [reportedOnly]);

  const toggleHide = async (id) => {
    try {
      const { data } = await api.put(`/admin/reviews/${id}/hide`);
      toast.success(data.review.isHidden ? 'Review hidden' : 'Review restored');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout title="Reviews" subtitle="Admin Panel" links={adminNavLinks}>
      <div className="mb-5 flex gap-2">
        <button
          onClick={() => setReportedOnly(true)}
          className={`rounded-full border px-4 py-1.5 text-xs font-medium ${reportedOnly ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-slate-soft'}`}
        >
          Reported
        </button>
        <button
          onClick={() => setReportedOnly(false)}
          className={`rounded-full border px-4 py-1.5 text-xs font-medium ${!reportedOnly ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-slate-soft'}`}
        >
          All reviews
        </button>
      </div>

      {loading ? (
        <Spinner label="Loading reviews" />
      ) : reviews.length === 0 ? (
        <EmptyState icon={MessageSquareWarning} title="Nothing here" message="No reviews match this filter." />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="glass-panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-warmwhite">
                    {r.customer?.name} → <span className="text-gold">{r.salon?.name}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-soft">{r.comment || 'No comment left.'}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge tone="gold">{r.rating}★</Badge>
                    {r.isReported && <Badge tone="red">Reported: {r.reportReason}</Badge>}
                    {r.isHidden && <Badge tone="neutral">Hidden</Badge>}
                  </div>
                </div>
                <button onClick={() => toggleHide(r._id)} className="btn-outline shrink-0 !px-4 !py-2 text-xs">
                  {r.isHidden ? 'Restore' : 'Hide'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
