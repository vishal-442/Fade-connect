import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, CalendarCheck, Sparkles, ArrowRight, Scissors, Clock, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import { SalonCard } from '../components/SalonCard';
import { Spinner } from '../components/ui/Primitives';

const STEPS = [
  { icon: MapPin, title: 'Find your salon', text: 'Search by name, city, rating, or the service you need.' },
  { icon: Scissors, title: 'Pick your barber & slot', text: 'Browse real barber profiles and live open time slots.' },
  { icon: CalendarCheck, title: 'Book & pay online', text: 'Confirm instantly, pay online, and walk in right on time.' },
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/salons', { params: { limit: 6, sort: '-ratingAverage' } })
      .then(({ data }) => setFeatured(data.salons))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (city) params.set('city', city);
    navigate(`/salons?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-fade-radial" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="mx-auto h-px w-24 fade-bar rounded-full" />
          <div className="mx-auto mt-8 max-w-3xl text-center">
            <p className="label-eyebrow justify-center flex items-center gap-2">
              <Sparkles size={13} /> No more waiting rooms
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.1] text-warmwhite sm:text-5xl lg:text-6xl">
              Book your next <span className="text-gold">fade</span>, not your next wait.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-slate-soft sm:text-lg">
              Fade Connect finds the barbers and salons near you, shows real open slots,
              and locks in your chair — before you even leave the house.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="glass-panel mx-auto mt-10 flex max-w-2xl flex-col gap-3 p-3 sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search size={17} className="text-gold/70 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Salon name or service (e.g. Beard Trim)"
                className="w-full bg-transparent py-2 text-sm text-warmwhite placeholder:text-slate-soft/60 focus:outline-none"
              />
            </div>
            <div className="hidden h-6 w-px bg-white/10 sm:block" />
            <div className="flex flex-1 items-center gap-2 px-3">
              <MapPin size={17} className="text-gold/70 shrink-0" />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full bg-transparent py-2 text-sm text-warmwhite placeholder:text-slate-soft/60 focus:outline-none"
              />
            </div>
            <button type="submit" className="btn-gold shrink-0">
              Search <ArrowRight size={15} />
            </button>
          </form>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="glass-panel gold-border-hover p-6">
              <span className="font-display text-3xl text-gold/30">{String(i + 1).padStart(2, '0')}</span>
              <s.icon className="mt-3 text-gold" size={22} strokeWidth={1.5} />
              <h3 className="mt-3 font-display text-lg text-warmwhite">{s.title}</h3>
              <p className="mt-1.5 text-sm text-slate-soft">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured salons */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="label-eyebrow">Top rated</p>
            <h2 className="mt-1 font-display text-2xl text-warmwhite sm:text-3xl">Popular salons near you</h2>
          </div>
          <button onClick={() => navigate('/salons')} className="hidden text-sm font-medium text-gold hover:text-gold-glow sm:flex items-center gap-1">
            View all <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <Spinner label="Finding top salons" />
        ) : featured.length === 0 ? (
          <p className="text-sm text-slate-soft">No salons yet — be the first to register one!</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <SalonCard key={s._id} salon={s} />
            ))}
          </div>
        )}
      </section>

      {/* Trust strip */}
      <section className="border-y border-white/5 bg-charcoal/40">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-14 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: Clock, title: 'Real-time slots', text: 'See exactly when a chair opens up — no guessing, no waiting around.' },
            { icon: ShieldCheck, title: 'Secure payments', text: 'Pay online with confidence; every booking is confirmed instantly.' },
            { icon: Sparkles, title: 'AI style match', text: 'Upload a selfie and get hairstyle picks matched to your face shape.' },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                <f.icon size={17} strokeWidth={1.5} />
              </span>
              <div>
                <h4 className="font-display text-base text-warmwhite">{f.title}</h4>
                <p className="mt-1 text-sm text-slate-soft">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
