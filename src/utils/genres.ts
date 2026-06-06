/** TMDB movie genre IDs and names (stable list from TMDB docs) */
export const GENRE_MAP: Record<number, string> = {
  28:    'Action',
  12:    'Adventure',
  16:    'Animation',
  35:    'Comedy',
  80:    'Crime',
  99:    'Documentary',
  18:    'Drama',
  10751: 'Family',
  14:    'Fantasy',
  36:    'History',
  27:    'Horror',
  10402: 'Music',
  9648:  'Mystery',
  10749: 'Romance',
  878:   'Science Fiction',
  10770: 'TV Movie',
  53:    'Thriller',
  10752: 'War',
  37:    'Western',
};

export function getGenreName(id: number): string {
  return GENRE_MAP[id] ?? 'Other';
}

/**
 * Groups movies by their primary (first) genre.
 * Returns an ordered array of { genreId, genreName, movies[] } —
 * genres are sorted by entry count descending so the richest rows appear first.
 */
export function groupByPrimaryGenre<T extends { genre_ids: number[] }>(
  movies: T[],
): { genreId: number; genreName: string; movies: T[] }[] {
  const map = new Map<number, T[]>();

  for (const movie of movies) {
    const primaryId = movie.genre_ids[0];
    if (primaryId === undefined) continue;
    if (!map.has(primaryId)) map.set(primaryId, []);
    map.get(primaryId)!.push(movie);
  }

  return [...map.entries()]
    .map(([genreId, items]) => ({
      genreId,
      genreName: getGenreName(genreId),
      movies: items,
    }))
    .sort((a, b) => b.movies.length - a.movies.length);
}
