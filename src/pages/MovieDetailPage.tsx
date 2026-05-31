import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { TMDBMovieDetail, CastMember, WatchProviderResult } from '../types/movie';
import type { Rating } from '../types/api';
import { getMovieDetail, getMovieCredits, getWatchProviders, buildImageUrl } from '../api';
import { getOMDBRatings } from '../api/omdb';
import { buildRatingsFromOMDB, buildTMDBRating } from '../utils/ratingHelpers';
import { formatRuntime, formatDate, formatCurrency } from '../utils/formatters';
import RatingBadge from '../components/ui/RatingBadge';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<TMDBMovieDetail | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [providers, setProviders] = useState<WatchProviderResult | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const movieId = parseInt(id, 10);
    if (isNaN(movieId)) { setError('Invalid movie ID.'); setIsLoading(false); return; }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [detail, credits, watchProviders] = await Promise.all([
          getMovieDetail(movieId),
          getMovieCredits(movieId),
          getWatchProviders(movieId),
        ]);

        if (cancelled) return;

        setMovie(detail);
        setCast(credits.cast.slice(0, 10));
        setProviders(watchProviders);

        // Build ratings: start with TMDB
        const ratingsList: Rating[] = [buildTMDBRating(detail.vote_average)];

        // Fetch OMDB ratings if we have an IMDb ID
        if (detail.imdb_id) {
          const omdb = await getOMDBRatings(detail.imdb_id);
          if (!cancelled && omdb) {
            ratingsList.push(...buildRatingsFromOMDB(omdb));
          }
        }

        if (!cancelled) setRatings(ratingsList);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load movie.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [id]);

  const backdropUrl = buildImageUrl(movie?.backdrop_path ?? null, 'original');
  const posterUrl = buildImageUrl(movie?.poster_path ?? null, 'w500');

  if (isLoading) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="detail-loading">
          <div className="detail-skeleton">
            <div className="detail-skeleton-backdrop shimmer" />
            <div className="detail-skeleton-content">
              <div className="detail-skeleton-poster shimmer" />
              <div className="detail-skeleton-info">
                <div className="detail-skeleton-title shimmer" />
                <div className="detail-skeleton-meta shimmer" />
                <div className="detail-skeleton-overview shimmer" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="detail-error">
          <p className="error-state-icon">⚠️</p>
          <p className="error-state-message">{error ?? 'Movie not found.'}</p>
          <Link to="/" className="btn-back">← Back to Home</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const flatrateProviders = providers?.flatrate ?? [];

  return (
    <div className="page-shell">
      <Navbar />

      <main className="detail-main">
        {/* Backdrop */}
        <div className="detail-backdrop-wrapper">
          {backdropUrl && (
            <img src={backdropUrl} alt="" className="detail-backdrop" aria-hidden="true" />
          )}
          <div className="detail-backdrop-gradient" />
        </div>

        {/* Content */}
        <div className="detail-content">
          {/* Back Button */}
          <button className="detail-back-btn" onClick={() => navigate(-1)} id="detail-back-btn">
            ← Back
          </button>

          <div className="detail-layout">
            {/* Poster Column */}
            <aside className="detail-poster-col">
              {posterUrl ? (
                <img src={posterUrl} alt={`${movie.title} poster`} className="detail-poster" />
              ) : (
                <div className="detail-poster-fallback">🎬</div>
              )}

              {/* Streaming Providers */}
              {flatrateProviders.length > 0 && (
                <div className="detail-providers">
                  <h3 className="detail-providers-title">Stream On</h3>
                  <div className="detail-providers-list">
                    {flatrateProviders.map((p) => (
                      <div key={p.provider_id} className="detail-provider-item" title={p.provider_name}>
                        <img
                          src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                          alt={p.provider_name}
                          className="detail-provider-logo"
                        />
                        <span className="detail-provider-name">{p.provider_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            {/* Info Column */}
            <section className="detail-info-col">
              {/* Title & Meta */}
              <div className="detail-title-row">
                <h1 className="detail-title">{movie.title}</h1>
                {movie.tagline && <p className="detail-tagline">"{movie.tagline}"</p>}
              </div>

              <div className="detail-meta-row">
                {movie.release_date && (
                  <span className="detail-meta-chip">{formatDate(movie.release_date)}</span>
                )}
                {movie.runtime && (
                  <span className="detail-meta-chip">{formatRuntime(movie.runtime)}</span>
                )}
                {movie.original_language && (
                  <span className="detail-meta-chip detail-meta-chip-upper">
                    {movie.original_language}
                  </span>
                )}
                {movie.status && (
                  <span className="detail-meta-chip">{movie.status}</span>
                )}
              </div>

              {/* Genres */}
              {movie.genres.length > 0 && (
                <div className="detail-genres">
                  {movie.genres.map((g) => (
                    <span key={g.id} className="detail-genre-tag">{g.name}</span>
                  ))}
                </div>
              )}

              {/* Ratings Row */}
              {ratings.length > 0 && (
                <div className="detail-ratings-section">
                  <h2 className="detail-section-title">Ratings</h2>
                  <div className="detail-ratings-row">
                    {ratings.map((r) => (
                      <RatingBadge key={r.source} rating={r} />
                    ))}
                  </div>
                </div>
              )}

              {/* Overview */}
              {movie.overview && (
                <div className="detail-overview-section">
                  <h2 className="detail-section-title">Overview</h2>
                  <p className="detail-overview">{movie.overview}</p>
                </div>
              )}

              {/* Budget & Revenue */}
              {(movie.budget > 0 || movie.revenue > 0) && (
                <div className="detail-financials">
                  {movie.budget > 0 && (
                    <div className="detail-financial-item">
                      <span className="detail-financial-label">Budget</span>
                      <span className="detail-financial-value">{formatCurrency(movie.budget)}</span>
                    </div>
                  )}
                  {movie.revenue > 0 && (
                    <div className="detail-financial-item">
                      <span className="detail-financial-label">Revenue</span>
                      <span className="detail-financial-value">{formatCurrency(movie.revenue)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Cast */}
              {cast.length > 0 && (
                <div className="detail-cast-section">
                  <h2 className="detail-section-title">Top Cast</h2>
                  <div className="detail-cast-list">
                    {cast.map((member) => {
                      const imgUrl = buildImageUrl(member.profile_path, 'w185');
                      return (
                        <div key={member.id} className="cast-member" title={member.name}>
                          <div className="cast-avatar">
                            {imgUrl ? (
                              <img src={imgUrl} alt={member.name} className="cast-avatar-img" />
                            ) : (
                              <span className="cast-avatar-fallback">👤</span>
                            )}
                          </div>
                          <p className="cast-name">{member.name}</p>
                          {member.character && (
                            <p className="cast-character">{member.character}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
