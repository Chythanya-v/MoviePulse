import type { Rating } from '../../types/api';
import { getScoreColor, getScoreBorderColor } from '../../utils/ratingHelpers';

const SOURCE_ICONS: Record<string, string> = {
  TMDB: '🎬',
  IMDb: '⭐',
  'Rotten Tomatoes': '🍅',
  Metacritic: '🎯',
};

interface RatingBadgeProps {
  rating: Rating;
  size?: 'sm' | 'md';
}

export default function RatingBadge({ rating, size = 'md' }: RatingBadgeProps) {
  const colorClass = getScoreColor(rating.normalized);
  const borderClass = getScoreBorderColor(rating.normalized);
  const sizeClass = size === 'sm' ? 'rating-badge-sm' : 'rating-badge-md';

  return (
    <div className={`rating-badge ${sizeClass} ${borderClass}`} title={`${rating.source}: ${rating.value}`}>
      <span className="rating-badge-icon">{SOURCE_ICONS[rating.source] ?? '📊'}</span>
      <div className="rating-badge-info">
        <span className="rating-badge-source">{rating.source}</span>
        <span className={`rating-badge-value ${colorClass}`}>{rating.value}</span>
      </div>
    </div>
  );
}
