export default function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-poster shimmer" />
      <div className="skeleton-info">
        <div className="skeleton-title shimmer" />
        <div className="skeleton-year shimmer" />
      </div>
    </div>
  );
}
