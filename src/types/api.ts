export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBCreditsResponse {
  id: number;
  cast: import('./movie').CastMember[];
  crew: import('./movie').CrewMember[];
}

export interface TMDBWatchProvidersResponse {
  id: number;
  results: Record<string, import('./movie').WatchProviderResult>;
}

export type RatingSource = 'TMDB' | 'IMDb' | 'Rotten Tomatoes' | 'Metacritic';

export interface Rating {
  source: RatingSource;
  value: string;
  normalized: number; // 0–100
}

export interface OMDBResponse {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Poster: string;
  Ratings: { Source: string; Value: string }[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  Response: 'True' | 'False';
  Error?: string;
}
