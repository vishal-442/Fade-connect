import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import api from '../../api/axios';
import { SalonCard } from '../../components/SalonCard';
import { Spinner, EmptyState } from '../../components/ui/Primitives';

export default function Favorites() {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/salons/mine/favorites')
      .then(({ data }) => setSalons(data.salons))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="label-eyebrow">Saved for later</p>
      <h1 className="mt-1 font-display text-3xl text-warmwhite">My Favorites</h1>

      <div className="mt-8">
        {loading ? (
          <Spinner label="Loading your favorites" />
        ) : salons.length === 0 ? (
          <EmptyState icon={Heart} title="No favorites yet" message="Tap the heart on any salon page to save it here." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {salons.map((s) => (
              <SalonCard key={s._id} salon={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
