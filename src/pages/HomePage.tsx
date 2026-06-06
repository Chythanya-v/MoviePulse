import { useState, useEffect, useRef } from 'react';
import { useMovies } from '../hooks/useMovies';
import { STREAMING_PROVIDERS } from '../config/providers';
import type { ProviderFilterId } from '../types/provider';
import MovieCard from '../components/ui/MovieCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const PROVIDER_TABS: { id: ProviderFilterId; label: string; icon: string }[] = [
  { id: null, label: 'All Movies', icon: '🌐' },
  { id: STREAMING_PROVIDERS.netflix.id, label: 'Netflix', icon: '🔴' },
  { id: STREAMING_PROVIDERS.prime.id, label: 'Prime Video', icon: '🔵' },
  { id: STREAMING_PROVIDERS.hotstar.id, label: 'Hotstar', icon: '💙' },
];

const SKELETONS = Array.from({ length: 20 });

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [providerId, setProviderId] = useState<ProviderFilterId>(null);

  const { movies, grouped, isLoading, error, page, totalPages, setPage, refresh } = useMovies({
    query,
    providerId,
  });

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Setup infinite scroll observer
  useEffect(() => {
    if (isLoading || error || page >= totalPages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage(page + 1);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    const currentBottom = bottomRef.current;
    if (currentBottom) {
      observer.observe(currentBottom);
    }

    return () => {
      if (currentBottom) {
        observer.unobserve(currentBottom);
      }
    };
  }, [isLoading, error, page, totalPages, setPage]);

  // Group view: active when a specific provider is selected and no search query
  const isGrouped = providerId !== null && !query.trim();

  const sectionTitle = query.trim()
    ? `Results for "${query.trim()}"`
    : providerId !== null
      ? `${PROVIDER_TABS.find((t) => t.id === providerId)?.label ?? 'Movies'}`
      : 'Trending This Week';

  function handleProviderChange(id: ProviderFilterId) {
    setProviderId(id);
    setQuery('');
  }

  return (
    <div className="page-shell">
      <Navbar onSearch={setQuery} searchValue={query} />

      <main className="home-main">
        {/* Hero Banner */}
        {!query && (
          <section className="home-hero">
            <div className="home-hero-content">
              <h1 className="home-hero-title">
                Discover Your Next <span className="home-hero-accent">Favourite Film</span>
              </h1>
              <p className="home-hero-subtitle">
                Browse trending movies, filter by streaming platform, and explore ratings from TMDB, IMDb, Rotten Tomatoes &amp; Metacritic.
              </p>
            </div>
            <div className="home-hero-glow" aria-hidden="true" />
          </section>
        )}

        {/* Provider Filter Tabs */}
        <section className="provider-tabs-section">
          <div className="provider-tabs">
            {PROVIDER_TABS.map((tab) => (
              <button
                key={String(tab.id)}
                id={`provider-tab-${tab.id ?? 'all'}`}
                className={`provider-tab ${providerId === tab.id ? 'provider-tab-active' : ''}`}
                onClick={() => handleProviderChange(tab.id)}
                aria-pressed={providerId === tab.id}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── GENRE-GROUPED VIEW (provider selected, no search) ── */}
        {isGrouped ? (
          <div className="genre-sections">
            {/* Section heading */}
            <div className="movies-section-header genre-sections-header">
              <h2 className="movies-section-title">{sectionTitle} — by Genre</h2>
              {!isLoading && !error && (
                <span className="movies-section-count">Loaded up to Page {page}</span>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="error-state">
                <p className="error-state-icon">⚠️</p>
                <p className="error-state-message">{error}</p>
                <button className="btn-retry" onClick={refresh}>Try Again</button>
              </div>
            )}

            {/* Loading skeletons for initial load */}
            {isLoading && page === 1 && !error && (
              <div className="movies-grid genre-sections-skeleton">
                {SKELETONS.map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Genre rows */}
            {!isLoading && page === 1 && !error && grouped.length === 0 && (
              <div className="empty-state">
                <p className="empty-state-icon">🎬</p>
                <p className="empty-state-message">No movies found for this provider.</p>
              </div>
            )}

            {grouped.map(({ genreId, genreName, movies: genreMovies }) => (
              <section key={genreId} className="genre-row-section">
                <div className="genre-row-header">
                  <h3 className="genre-row-title">
                    <span className="genre-row-pill">{genreName}</span>
                  </h3>
                  <span className="genre-row-count">{genreMovies.length} film{genreMovies.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="genre-row-scroll" role="list" aria-label={`${genreName} movies`}>
                  {genreMovies.map((movie) => (
                    <div key={movie.id} className="genre-row-item" role="listitem">
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Infinite loading sentinel element */}
            {!error && page < totalPages && (
              <div ref={bottomRef} className="infinite-scroll-sentinel">
                {isLoading && (
                  <div className="infinite-scroll-loader">
                    <div className="loader-spinner" />
                    <span>Loading more movies...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ── FLAT GRID VIEW (All Movies or search results) ── */
          <section className="movies-section">
            <div className="movies-section-header">
              <h2 className="movies-section-title">{sectionTitle}</h2>
              {!isLoading && !error && (
                <span className="movies-section-count">
                  Loaded up to Page {page}
                </span>
              )}
            </div>

            {error && (
              <div className="error-state">
                <p className="error-state-icon">⚠️</p>
                <p className="error-state-message">{error}</p>
                <button className="btn-retry" onClick={refresh}>Try Again</button>
              </div>
            )}

            {/* Flat movie grid */}
            <div className="movies-grid">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
              {/* Skeletons for initial loading */}
              {isLoading && page === 1 && !error && (
                SKELETONS.map((_, i) => <SkeletonCard key={i} />)
              )}
            </div>

            {/* Skeletons for subsequent pages (appended at the bottom of the grid) */}
            {isLoading && page > 1 && (
              <div className="movies-grid-append-loading">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={`more-skeletons-${i}`} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && movies.length === 0 && (
              <div className="empty-state">
                <p className="empty-state-icon">🎬</p>
                <p className="empty-state-message">No movies found. Try a different search.</p>
              </div>
            )}

            {/* Infinite loading sentinel element */}
            {!error && page < totalPages && (
              <div ref={bottomRef} className="infinite-scroll-sentinel">
                {!isLoading && <div style={{ height: '20px' }} />}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

