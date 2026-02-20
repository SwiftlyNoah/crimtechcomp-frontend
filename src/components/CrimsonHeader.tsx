import { useState, useEffect, useRef, useCallback } from 'react';
import { CATEGORIES, type Category } from '../types';
import './CrimsonHeader.css';

interface CrimsonHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeCategory: Category | null;
  onCategoryChange: (category: Category | null) => void;
  readingMode: boolean;
  onToggleReadingMode: () => void;
}

function getFormattedDate(): string {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
}

export default function CrimsonHeader({
  searchValue,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  readingMode,
  onToggleReadingMode,
}: CrimsonHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mastheadRef = useRef<HTMLDivElement>(null);
  const mastheadHeight = useRef(0);

  // Measure masthead height and collapse when scrolled past it
  const updateCollapsed = useCallback(() => {
    const masthead = mastheadRef.current;
    if (masthead && !collapsed) {
      mastheadHeight.current = masthead.offsetHeight;
    }
    // Nav bar is ~44px, so threshold is when scroll exceeds masthead height
    setCollapsed(window.scrollY > mastheadHeight.current);
  }, [collapsed]);

  useEffect(() => {
    // Measure on mount
    if (mastheadRef.current) {
      mastheadHeight.current = mastheadRef.current.offsetHeight;
    }
    window.addEventListener('scroll', updateCollapsed, { passive: true });
    return () => window.removeEventListener('scroll', updateCollapsed);
  }, [updateCollapsed]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close menu on resize to desktop (only when not collapsed)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 960 && !collapsed) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.crimson-nav') && !target.closest('.nav-mobile-dropdown')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [menuOpen]);

  const handleCategoryClick = (cat: Category | null) => {
    onCategoryChange(cat);
    setMenuOpen(false);
  };

  return (
    <header className={`crimson-header${collapsed ? ' collapsed' : ''}`}>
      {/* ── Nav Bar ── */}
      <nav className="crimson-nav">
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(m => !m)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4h14M2 9h14M2 14h14" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="hamburger-label">Sections</span>
        </button>

        <span className="nav-collapsed-title">The Harvard Crimson</span>

        <div className="nav-links">
          <button
            className={`nav-link${activeCategory === null ? ' active' : ''}`}
            onClick={() => handleCategoryClick(null)}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`nav-link${activeCategory === cat ? ' active' : ''}`}
              onClick={() => handleCategoryClick(activeCategory === cat ? null : cat)}
            >
              {cat}
            </button>
          ))}
          <span className="nav-divider">|</span>
          <button
            className={`nav-link nav-link-reading${readingMode ? ' active' : ''}`}
            onClick={onToggleReadingMode}
          >
            {readingMode ? 'Exit Reading' : 'Reading Mode'}
          </button>
        </div>

        <button
          className="nav-search-btn"
          onClick={() => setSearchOpen(s => !s)}
          aria-label="Search"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="7.5" cy="7.5" r="5.5" stroke="white" strokeWidth="2" />
            <path d="M12 12l4 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {/* ── Search Bar (slides open) ── */}
      {searchOpen && (
        <div className="crimson-search-bar">
          <div className="search-input-wrap">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search articles..."
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
            />
            {searchValue && (
              <button
                className="search-clear-btn"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>
          <button
            className="search-close-btn"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Dropdown Menu ── */}
      {menuOpen && (
        <div className="nav-mobile-dropdown">
          <button
            className={`mobile-nav-link${activeCategory === null ? ' active' : ''}`}
            onClick={() => handleCategoryClick(null)}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`mobile-nav-link${activeCategory === cat ? ' active' : ''}`}
              onClick={() => handleCategoryClick(activeCategory === cat ? null : cat)}
            >
              {cat}
            </button>
          ))}
          <div className="mobile-nav-divider" />
          <button
            className={`mobile-nav-link${readingMode ? ' active' : ''}`}
            onClick={() => { onToggleReadingMode(); setMenuOpen(false); }}
          >
            {readingMode ? 'Exit Reading Mode' : 'Reading Mode'}
          </button>
        </div>
      )}

      {/* ── Masthead ── */}
      <div className="crimson-masthead" ref={mastheadRef}>
        <h1 className="masthead-title">The Harvard Crimson</h1>
        <div className="masthead-meta">
          <span className="masthead-date">{getFormattedDate()}</span>
          <span className="masthead-tagline">The University Daily Est. 1873</span>
          <span className="masthead-volume">VOLUME CLIII</span>
        </div>
      </div>
    </header>
  );
}
