import { useState } from 'react';
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

  const { movies, isLoading, error, page, totalPages, setPage, refresh } = useMovies({
    query,
    providerId,
  });

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

        {/* Section Title */}
        <section className="movies-section">
          <div className="movies-section-header">
            <h2 className="movies-section-title">{sectionTitle}</h2>
            {!isLoading && !error && (
              <span className="movies-section-count">
                Page {page} of {totalPages}
              </span>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="error-state">
              <p className="error-state-icon">⚠️</p>
              <p className="error-state-message">{error}</p>
              <button className="btn-retry" onClick={refresh}>Try Again</button>
            </div>
          )}

          {/* Movie Grid */}
          {!error && (
            <div className="movies-grid">
              {isLoading
                ? SKELETONS.map((_, i) => <SkeletonCard key={i} />)
                : movies.length === 0
                  ? (
                    <div className="empty-state">
                      <p className="empty-state-icon">🎬</p>
                      <p className="empty-state-message">No movies found. Try a different search.</p>
                    </div>
                  )
                  : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)
              }
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && totalPages > 1 && (
            <div className="pagination">
              <button
                id="pagination-prev"
                className="pagination-btn"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                ← Prev
              </button>

              <div className="pagination-pages">
                {getPaginationRange(page, totalPages).map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
                  ) : (
                    <button
                      key={p}
                      id={`pagination-page-${p}`}
                      className={`pagination-page ${page === p ? 'pagination-page-active' : ''}`}
                      onClick={() => setPage(p as number)}
                      aria-label={`Page ${p}`}
                      aria-current={page === p ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <button
                id="pagination-next"
                className="pagination-btn"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                Next →
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

function getPaginationRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}
