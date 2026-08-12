import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Phone, Clock, Heart, Scissors, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StarRating } from '../../components/ui/StarRating';
import { Spinner, EmptyState, Badge } from '../../components/ui/Primitives';

const DAY_LABEL = { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' };

export default function SalonDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [tab, setTab] = useState('services');

  useEffect(() => {
    setLoading(true);
    api
      .get(`/salons/${id}`)
      .then(({ data }) => {
        setData(data);
        setIsFavorite(user?.favorites?.includes(id) || false);
      })
      .catch(() => toast.error('Could not load this salon'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await api.put(`/salons/${id}/favorite`);
      setIsFavorite(data.isFavorite);
      toast.success(data.isFavorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const startBooking = (serviceId, barberId) => {
    if (!user) return navigate('/login', { state: { from: `/salons/${id}` } });
    if (user.role !== 'customer') return toast.error('Only customer accounts can book appointments');
    const params = new URLSearchParams({ salonId: id });
    if (serviceId) params.set('serviceId', serviceId);
    if (barberId) params.set('barberId', barberId);
    navigate(`/book?${params.toString()}`);
  };

  if (loading) return <Spinner label="Loading salon" />;
  if (!data) return <EmptyState title="Salon not found" />;

  const { salon, services, barbers, reviews } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Gallery / header */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:grid-rows-2">
        {(salon.images.length ? salon.images : [{ url: null }]).slice(0, 4).map((img, i) => (
          <div
            key={i}
            className={`overflow-hidden rounded-2xl bg-charcoal ${i === 0 ? 'sm:col-span-2 sm:row-span-2' : ''} h-48 sm:h-full`}
          >
            {img.url ? (
              <img src={img.url} alt={salon.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-charcoal to-ink font-display text-5xl text-gold/20">
                {salon.name[0]}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-display text-3xl text-warmwhite">{salon.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-soft">
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gold/70" /> {salon.location.address}, {salon.location.city}</span>
            {salon.contact?.phone && <span className="flex items-center gap-1.5"><Phone size={14} className="text-gold/70" /> {salon.contact.phone}</span>}
          </div>
          <div className="mt-3">
            <StarRating value={salon.ratingAverage} count={salon.ratingCount} size={16} />
          </div>
        </div>
        <button onClick={toggleFavorite} className={`btn-outline shrink-0 ${isFavorite ? '!border-gold/50 !text-gold' : ''}`}>
          <Heart size={15} className={isFavorite ? 'fill-gold' : ''} /> {isFavorite ? 'Saved' : 'Save'}
        </button>
      </div>

      {salon.description && <p className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-soft">{salon.description}</p>}

      {salon.amenities?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {salon.amenities.map((a) => (
            <Badge key={a}>{a}</Badge>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="mt-10 flex gap-6 border-b border-white/5">
        {['services', 'barbers', 'hours', 'location', 'reviews'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 pb-3 text-sm font-medium capitalize transition-colors ${
              tab === t ? 'border-gold text-gold' : 'border-transparent text-slate-soft hover:text-warmwhite'
            }`}
          >
            {t} {t === 'reviews' && `(${reviews.length})`}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'services' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {services.length === 0 && <EmptyState title="No services listed yet" />}
            {services.map((s) => (
              <div key={s._id} className="glass-panel flex items-center justify-between gap-4 p-5">
                <div>
                  <h4 className="font-display text-base text-warmwhite">{s.name}</h4>
                  <p className="mt-1 text-xs text-slate-soft">{s.description}</p>
                  <p className="mt-2 flex items-center gap-3 text-sm">
                    <span className="text-gold font-semibold">₹{s.price}</span>
                    <span className="flex items-center gap-1 text-slate-soft"><Clock size={13} /> {s.durationMinutes} min</span>
                  </p>
                </div>
                <button onClick={() => startBooking(s._id)} className="btn-gold shrink-0 !px-4 !py-2 text-sm">Book</button>
              </div>
            ))}
          </div>
        )}

        {tab === 'barbers' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {barbers.length === 0 && <EmptyState title="No barbers listed yet" />}
            {barbers.map((b) => (
              <div key={b._id} className="glass-panel p-5">
                <div className="flex items-center gap-3">
                  {b.photo?.url ? (
                    <img src={b.photo.url} alt={b.name} className="h-14 w-14 rounded-full object-cover border border-gold/30" />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-charcoal text-gold">
                      <Scissors size={20} />
                    </span>
                  )}
                  <div>
                    <h4 className="font-display text-base text-warmwhite">{b.name}</h4>
                    <p className="flex items-center gap-1 text-xs text-slate-soft"><Award size={12} /> {b.experienceYears} yrs experience</p>
                  </div>
                </div>
                {b.specialties?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {b.specialties.map((sp) => <Badge key={sp}>{sp}</Badge>)}
                  </div>
                )}
                <button onClick={() => startBooking(null, b._id)} className="btn-outline mt-4 w-full !py-2 text-sm">
                  Book with {b.name.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'hours' && (
          <div className="glass-panel max-w-sm divide-y divide-white/5 p-2">
            {salon.businessHours.map((h) => (
              <div key={h.day} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="font-medium text-warmwhite">{DAY_LABEL[h.day]}</span>
                <span className="text-slate-soft">{h.isOpen ? `${h.open} – ${h.close}` : 'Closed'}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'location' && (
          <div className="glass-panel overflow-hidden">
            <iframe
              title={`${salon.name} location`}
              width="100%"
              height="360"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://www.google.com/maps?q=${salon.location.lat},${salon.location.lng}&hl=en&z=15&output=embed`}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="flex items-center gap-2 text-sm text-slate-soft">
                <MapPin size={14} className="text-gold/70" />
                {salon.location.address}, {salon.location.city}
                {salon.location.state ? `, ${salon.location.state}` : ''} {salon.location.pincode}
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${salon.location.lat},${salon.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="btn-outline !px-4 !py-2 text-xs"
              >
                Get directions
              </a>
            </div>
          </div>
        )}

        {tab === 'reviews' && (
          <div className="flex flex-col gap-4">
            {reviews.length === 0 && <EmptyState title="No reviews yet" message="Be the first to book and review this salon." />}
            {reviews.map((r) => (
              <div key={r._id} className="glass-panel p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-charcoal text-xs font-medium text-gold">
                      {r.customer?.name?.[0] || '?'}
                    </span>
                    <span className="text-sm font-medium text-warmwhite">{r.customer?.name || 'Customer'}</span>
                  </div>
                  <StarRating value={r.rating} size={13} />
                </div>
                {r.comment && <p className="mt-3 text-sm text-slate-soft">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
