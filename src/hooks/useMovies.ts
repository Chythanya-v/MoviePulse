import { useState, useEffect, useCallback } from 'react';
import type { TMDBMovie } from '../types/movie';
import { getTrending, searchMovies, getMoviesByProvider } from '../api';
import { STREAMING_PROVIDERS } from '../config/providers';
import { useDebounce } from './useDebounce';
import { groupByPrimaryGenre } from '../utils/genres';

export interface GenreGroup {
  genreId: number;
  genreName: string;
  movies: TMDBMovie[];
}

interface UseMoviesOptions {
  query: string;
  providerId: number | null;
}

interface UseMoviesResult {
  movies: TMDBMovie[];
  grouped: GenreGroup[];
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  refresh: () => void;
}

export function useMovies({ query, providerId }: UseMoviesOptions): UseMoviesResult {
  const debouncedQuery = useDebounce(query, 400);

  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [grouped, setGrouped] = useState<GenreGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Reset to page 1 when query or provider changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, providerId]);

  useEffect(() => {
    let cancelled = false;

    async function fetchMovies() {
      setIsLoading(true);
      setError(null);
      try {
        let result;
        if (debouncedQuery.trim()) {
          result = await searchMovies(debouncedQuery.trim(), page);
        } else if (providerId !== null) {
          // Look up the watch region for this provider (Hotstar needs 'IN', others 'US')
          const providerConfig = Object.values(STREAMING_PROVIDERS).find(
            (p) => p.id === providerId,
          );
          const region = providerConfig?.watchRegion ?? 'IN';
          
          if (page === 1) {
            // Fetch first 3 pages concurrently to populate genre rows with a rich selection
            const [r1, r2, r3] = await Promise.all([
              getMoviesByProvider(providerId, 1, region),
              getMoviesByProvider(providerId, 2, region),
              getMoviesByProvider(providerId, 3, region),
            ]);
            result = {
              results: [...(r1.results ?? []), ...(r2.results ?? []), ...(r3.results ?? [])],
              total_pages: r1.total_pages,
            };
          } else {
            // Since page 1 already fetched pages 1, 2, and 3, page 2 should fetch page 4
            const tmdbPage = page + 2;
            result = await getMoviesByProvider(providerId, tmdbPage, region);
          }
        } else {
          result = await getTrending(page);
        }
        if (!cancelled) {
          // Filter movies to only show those with rating >= 6.0
          const filtered = (result.results ?? []).filter(
            (movie) => movie.vote_average >= 6.0
          );

          // Sort by rating (highest first)
          const sorted = [...filtered].sort(
            (a, b) => b.vote_average - a.vote_average,
          );

          setMovies((prev) => {
            const next = page === 1 ? sorted : [...prev, ...sorted];
            // Deduplicate movies by ID to avoid duplicates and React key warnings
            const unique = Array.from(new Map(next.map((m) => [m.id, m])).values());
            // Update grouped based on the accumulated unique movies list to keep them in sync
            setGrouped(groupByPrimaryGenre(unique));
            return unique;
          });

          setTotalPages(Math.min(result.total_pages, 500));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load movies.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchMovies();
    return () => { cancelled = true; };
  }, [debouncedQuery, providerId, page, refreshKey]);

  return { movies, grouped, isLoading, error, page, totalPages, setPage, refresh };
}
