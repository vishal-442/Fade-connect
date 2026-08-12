import { Link } from 'react-router-dom';
import { MapPin, IndianRupee } from 'lucide-react';
import { StarRating } from './ui/StarRating';

const PRICE_LABEL = { 1: '₹', 2: '₹₹', 3: '₹₹₹', 4: '₹₹₹₹' };

export function SalonCard({ salon }) {
  const cover = salon.images?.[0]?.url;
  return (
    <Link
      to={`/salons/${salon._id}`}
      className="group glass-panel gold-border-hover flex flex-col overflow-hidden"
    >
      <div className="relative h-44 w-full overflow-hidden bg-charcoal">
        {cover ? (
          <img
            src={cover}
            alt={salon.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-charcoal to-ink text-4xl font-display text-gold/30">
            {salon.name?.[0]}
          </div>
        )}
        <div className="absolute right-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-gold backdrop-blur">
          {PRICE_LABEL[salon.priceLevel] || '₹₹'}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-lg leading-tight text-warmwhite group-hover:text-gold transition-colors">
          {salon.name}
        </h3>
        <div className="flex items-center gap-1 text-xs text-slate-soft">
          <MapPin size={13} className="text-gold/70" />
          {salon.location?.city}
        </div>
        <StarRating value={salon.ratingAverage || 0} count={salon.ratingCount || 0} />
      </div>
    </Link>
  );
}
