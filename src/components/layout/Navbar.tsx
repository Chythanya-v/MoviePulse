import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface NavbarProps {
  onSearch?: (query: string) => void;
  searchValue?: string;
}

export default function Navbar({ onSearch, searchValue = '' }: NavbarProps) {
  const [inputValue, setInputValue] = useState(searchValue);
  const navigate = useNavigate();

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInputValue(val);
    onSearch?.(val);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inputValue.trim()) navigate('/');
    onSearch?.(inputValue);
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => { setInputValue(''); onSearch?.(''); }}>
          <span className="navbar-logo-icon">🎬</span>
          <span className="navbar-logo-text">
            Movie<span className="navbar-logo-accent">Pulse</span>
          </span>
        </Link>

        {/* Search */}
        <form className="navbar-search-form" onSubmit={handleSubmit} role="search">
          <div className="navbar-search-wrapper">
            <svg className="navbar-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              id="navbar-search"
              type="search"
              placeholder="Search movies…"
              className="navbar-search-input"
              value={inputValue}
              onChange={handleInput}
              aria-label="Search movies"
            />
            {inputValue && (
              <button
                type="button"
                className="navbar-search-clear"
                onClick={() => { setInputValue(''); onSearch?.(''); }}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </form>
      </div>
    </header>
  );
}
