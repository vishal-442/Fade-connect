import { Star } from 'lucide-react';

export function StarRating({ value = 0, count, size = 15, interactive = false, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center gap-0.5">
        {stars.map((s) => (
          <Star
            key={s}
            size={size}
            strokeWidth={1.5}
            className={
              s <= Math.round(value)
                ? 'fill-gold text-gold'
                : 'fill-transparent text-slate-soft/40'
            }
            onClick={interactive ? () => onChange?.(s) : undefined}
            style={interactive ? { cursor: 'pointer' } : undefined}
          />
        ))}
      </span>
      {typeof count === 'number' && (
        <span className="text-xs text-slate-soft">
          {value.toFixed(1)} ({count})
        </span>
      )}
    </span>
  );
}
