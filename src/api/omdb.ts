import type { OMDBResponse } from '../types/api';

const BASE_URL = import.meta.env.VITE_OMDB_BASE_URL ?? 'https://www.omdbapi.com';
const API_KEY = import.meta.env.VITE_OMDB_API_KEY as string;

/** Fetch full OMDB data (ratings) by IMDb ID */
export async function getOMDBRatings(imdbId: string): Promise<OMDBResponse | null> {
  if (!imdbId || !API_KEY) return null;
  const url = new URL(BASE_URL);
  url.searchParams.set('i', imdbId);
  url.searchParams.set('apikey', API_KEY);
  url.searchParams.set('tomatoes', 'true');
  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as OMDBResponse;
    return data.Response === 'True' ? data : null;
  } catch {
    return null;
  }
}
