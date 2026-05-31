import { useState, useEffect, useCallback } from 'react';
import type { TMDBMovie } from '../types/movie';
import { getTrending, searchMovies, getMoviesByProvider } from '../api';
import { STREAMING_PROVIDERS } from '../config/providers';
import { useDebounce } from './useDebounce';

interface UseMoviesOptions {
  query: string;
  providerId: number | null;
}

interface UseMoviesResult {
  movies: TMDBMovie[];
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
          result = await getMoviesByProvider(providerId, page, region);
        } else {
          result = await getTrending(page);
        }
        if (!cancelled) {
          // Sort by rating (highest first) — discover already has server-side sort,
          // but trending and search results need client-side sort too.
          const sorted = [...result.results].sort(
            (a, b) => b.vote_average - a.vote_average,
          );
          setMovies(sorted);
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

  return { movies, isLoading, error, page, totalPages, setPage, refresh };
}
