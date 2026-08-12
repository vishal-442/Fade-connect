import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import { SalonCard } from '../../components/SalonCard';
import { Spinner, EmptyState } from '../../components/ui/Primitives';

export default function SearchSalons() {
  const [params, setParams] = useSearchParams();
  const [salons, setSalons] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState(params.get('q') || '');
  const [city, setCity] = useState(params.get('city') || '');
  const [minRating, setMinRating] = useState(params.get('minRating') || '');
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '');
  const [service, setService] = useState(params.get('service') || '');
  const [showFilters, setShowFilters] = useState(false);

  const page = Number(params.get('page') || 1);

  useEffect(() => {
    setLoading(true);
    const query = Object.fromEntries(params.entries());
    api
      .get('/salons', { params: { ...query, limit: 9 } })
      .then(({ data }) => {
        setSalons(data.salons);
        setPagination(data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params]);

  const applyFilters = (e) => {
    e?.preventDefault();
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (city) next.set('city', city);
    if (minRating) next.set('minRating', minRating);
    if (maxPrice) next.set('maxPrice', maxPrice);
    if (service) next.set('service', service);
    setParams(next);
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(params);
    next.set('page', p);
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-2">
        <p className="label-eyebrow">Discover</p>
        <h1 className="mt-1 font-display text-3xl text-warmwhite">Find your next salon</h1>
      </div>

      <form onSubmit={applyFilters} className="glass-panel mt-6 flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-ink-light/50 px-3.5 py-2.5">
            <Search size={16} className="text-gold/70 shrink-0" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Salon or service" className="w-full bg-transparent text-sm text-warmwhite placeholder:text-slate-soft/60 focus:outline-none" />
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-ink-light/50 px-3.5 py-2.5">
            <MapPin size={16} className="text-gold/70 shrink-0" />
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full bg-transparent text-sm text-warmwhite placeholder:text-slate-soft/60 focus:outline-none" />
          </div>
          <button type="button" onClick={() => setShowFilters((s) => !s)} className="btn-outline shrink-0 !px-4">
            <SlidersHorizontal size={15} /> Filters
          </button>
          <button type="submit" className="btn-gold shrink-0">Search</button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 gap-3 border-t border-white/5 pt-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs text-slate-soft">
              Minimum rating
              <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="input-field !py-2 text-sm">
                <option value="">Any</option>
                {[3, 3.5, 4, 4.5].map((r) => (
                  <option key={r} value={r}>{r}+ stars</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-soft">
              Max price level
              <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="input-field !py-2 text-sm">
                <option value="">Any</option>
                <option value="1">₹ Budget</option>
                <option value="2">₹₹ Moderate</option>
                <option value="3">₹₹₹ Premium</option>
                <option value="4">₹₹₹₹ Luxury</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-soft">
              Service
              <input value={service} onChange={(e) => setService(e.target.value)} placeholder="e.g. Hair Spa" className="input-field !py-2 text-sm" />
            </label>
          </div>
        )}
      </form>

      <div className="mt-8">
        {loading ? (
          <Spinner label="Searching salons" />
        ) : salons.length === 0 ? (
          <EmptyState title="No salons match your search" message="Try widening your filters or searching a different city." />
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-soft">{pagination.total} salon{pagination.total !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {salons.map((s) => (
                <SalonCard key={s._id} salon={s} />
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button disabled={page <= 1} onClick={() => goToPage(page - 1)} className="btn-outline !px-3 !py-2 disabled:opacity-30">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-slate-soft">Page {page} of {pagination.pages}</span>
                <button disabled={page >= pagination.pages} onClick={() => goToPage(page + 1)} className="btn-outline !px-3 !py-2 disabled:opacity-30">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
