import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { TMDBMovie } from '../../types/movie';
import { buildImageUrl } from '../../api/tmdb';
import { getExternalIds } from '../../api';
import { getOMDBRatings } from '../../api/omdb';
import { formatYear, truncate } from '../../utils/formatters';
import { getTMDBRatingColor } from '../../utils/ratingHelpers';

// Module-level caches: movie id → imdb_id, imdb_id → RT rating string
const imdbCache = new Map<number, string | null>();
const rtCache = new Map<string, string | null>();

interface MovieCardProps {
  movie: TMDBMovie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const posterUrl = buildImageUrl(movie.poster_path, 'w342');
  const year = formatYear(movie.release_date);
  const ratingColor = getTMDBRatingColor(movie.vote_average);

  const [rtRating, setRtRating] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchRT() {
      // Check imdb_id cache first
      let imdbId: string | null | undefined = imdbCache.get(movie.id);

      if (imdbId === undefined) {
        // Not cached yet — fetch external IDs
        try {
          const ext = await getExternalIds(movie.id);
          imdbId = ext.imdb_id ?? null;
        } catch {
          imdbId = null;
        }
        imdbCache.set(movie.id, imdbId);
      }

      if (!imdbId || cancelled) return;

      // Check RT cache
      let rt = rtCache.get(imdbId);
      if (rt === undefined) {
        try {
          const omdb = await getOMDBRatings(imdbId);
          const rtEntry = omdb?.Ratings?.find((r) => r.Source === 'Rotten Tomatoes');
          rt = rtEntry?.Value ?? null;
        } catch {
          rt = null;
        }
        rtCache.set(imdbId, rt ?? null);
      }

      if (!cancelled) setRtRating(rt ?? null);
    }

    void fetchRT();
    return () => { cancelled = true; };
  }, [movie.id]);

  return (
    <Link to={`/movie/${movie.id}`} className="movie-card" aria-label={`View details for ${movie.title}`}>
      {/* Poster */}
      <div className="movie-card-poster-wrapper">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`${movie.title} poster`}
            className="movie-card-poster"
            loading="lazy"
          />
        ) : (
          <div className="movie-card-poster-fallback">
            <span>🎬</span>
            <p>No Image</p>
          </div>
        )}

        {/* TMDB Rating badge — top-right */}
        <div className={`movie-card-rating ${ratingColor}`}>
          ⭐ {movie.vote_average.toFixed(1)}
        </div>

        {/* RT badge — top-left */}
        {rtRating && (
          <div className="movie-card-rt-badge">
            🍅 {rtRating}
          </div>
        )}

        {/* Hover overlay */}
        <div className="movie-card-overlay">
          <p className="movie-card-overlay-overview">
            {truncate(movie.overview || 'No overview available.', 120)}
          </p>
          <span className="movie-card-overlay-cta">View Details →</span>
        </div>
      </div>

      {/* Info */}
      <div className="movie-card-info">
        <h3 className="movie-card-title">{movie.title}</h3>
        <div className="movie-card-meta">
          {year && <span className="movie-card-year">{year}</span>}
        </div>
      </div>
    </Link>
  );
}
