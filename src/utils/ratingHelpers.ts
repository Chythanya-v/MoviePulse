import type { Rating, RatingSource, OMDBResponse } from '../types/api';

/** Convert a 0–10 TMDB vote to a color class */
export function getTMDBRatingColor(avg: number): string {
  if (avg >= 7) return 'text-emerald-400';
  if (avg >= 5) return 'text-amber-400';
  return 'text-red-400';
}

/** Return a 0–100 normalized score from any rating source */
export function normalizeRating(_source: string, value: string): number {
  const clean = value.trim();
  // "7.5/10"
  if (clean.includes('/10')) {
    const n = parseFloat(clean);
    return isNaN(n) ? 0 : Math.round(n * 10);
  }
  // "74%"
  if (clean.endsWith('%')) {
    const n = parseFloat(clean);
    return isNaN(n) ? 0 : Math.round(n);
  }
  // "72/100"
  if (clean.includes('/100')) {
    const n = parseFloat(clean);
    return isNaN(n) ? 0 : Math.round(n);
  }
  return 0;
}

/** Get a color class based on a 0–100 score */
export function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
}

/** Get border/ring color for a score */
export function getScoreBorderColor(score: number): string {
  if (score >= 70) return 'border-emerald-400/40';
  if (score >= 50) return 'border-amber-400/40';
  return 'border-red-400/40';
}

/** Build a normalized Rating[] array from an OMDBResponse */
export function buildRatingsFromOMDB(omdb: OMDBResponse): Rating[] {
  const ratings: Rating[] = [];
  for (const r of omdb.Ratings) {
    let source: RatingSource | null = null;
    if (r.Source === 'Internet Movie Database') source = 'IMDb';
    else if (r.Source === 'Rotten Tomatoes') source = 'Rotten Tomatoes';
    else if (r.Source === 'Metacritic') source = 'Metacritic';
    if (source) {
      ratings.push({
        source,
        value: r.Value,
        normalized: normalizeRating(r.Source, r.Value),
      });
    }
  }
  return ratings;
}

/** Build a TMDB rating entry */
export function buildTMDBRating(avg: number): Rating {
  return {
    source: 'TMDB',
    value: `${avg.toFixed(1)}/10`,
    normalized: Math.round(avg * 10),
  };
}
