export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-brand">
          <span className="footer-logo">🎬</span>
          Movie<span className="footer-accent">Pulse</span>
        </p>
        <p className="footer-attribution">
          Data provided by{' '}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="footer-link">
            TMDB
          </a>{' '}
          &amp;{' '}
          <a href="https://www.omdbapi.com/" target="_blank" rel="noopener noreferrer" className="footer-link">
            OMDb
          </a>
          . Not affiliated with the above services.
        </p>
        <p className="footer-copy">© {new Date().getFullYear()} MoviePulse. Built with React &amp; TypeScript.</p>
      </div>
    </footer>
  );
}
