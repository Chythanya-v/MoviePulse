import type { TMDBMovie, TMDBMovieDetail, WatchProviderResult } from '../types/movie';
import type {
  TMDBResponse,
  TMDBCreditsResponse,
  TMDBWatchProvidersResponse,
} from '../types/api';

const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL ?? 'https://api.themoviedb.org';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string;

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}/3${path}`);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', 'en-US');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** Trending movies this week */
export async function getTrending(page = 1): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch<TMDBResponse<TMDBMovie>>('/trending/movie/week', {
    page: String(page),
  });
}

/** Full-text movie search */
export async function searchMovies(
  query: string,
  page = 1,
): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch<TMDBResponse<TMDBMovie>>('/search/movie', {
    query,
    page: String(page),
    include_adult: 'false',
  });
}

/** Discover movies available on a specific streaming provider */
export async function getMoviesByProvider(
  providerId: number,
  page = 1,
  watchRegion = 'IN',
): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch<TMDBResponse<TMDBMovie>>('/discover/movie', {
    with_watch_providers: String(providerId),
    watch_region: watchRegion,
    sort_by: 'vote_average.desc',
    'vote_count.gte': '100',
    page: String(page),
  });
}

/** External IDs for a movie (includes imdb_id) */
export async function getExternalIds(id: number): Promise<{ imdb_id: string | null }> {
  return tmdbFetch<{ imdb_id: string | null }>(`/movie/${id}/external_ids`);
}

/** Full movie details (includes imdb_id, runtime, genres, etc.) */
export async function getMovieDetail(id: number): Promise<TMDBMovieDetail> {
  return tmdbFetch<TMDBMovieDetail>(`/movie/${id}`);
}

/** Movie cast & crew */
export async function getMovieCredits(id: number): Promise<TMDBCreditsResponse> {
  return tmdbFetch<TMDBCreditsResponse>(`/movie/${id}/credits`);
}

/** Where to watch (streaming providers per region) */
export async function getWatchProviders(id: number): Promise<WatchProviderResult | null> {
  const data = await tmdbFetch<TMDBWatchProvidersResponse>(`/movie/${id}/watch/providers`);
  return data.results?.IN ?? null;
}

/** Build a full image URL from a TMDB path */
export function buildImageUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
