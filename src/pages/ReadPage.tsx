import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { useArticleFeed } from '../hooks/useArticleFeed';
import { useActiveArticle } from '../hooks/useActiveArticle';
import { useSessionRestore, type SavedState } from '../hooks/useSessionRestore';
import ArticleCard from '../components/ArticleCard';
import Sidebar from '../components/Sidebar';
import CrimsonHeader from '../components/CrimsonHeader';
import type { Category } from '../types';
import './ReadPage.css';

export default function ReadPage() {
  const navigate = useNavigate();
  const { getSavedState, saveState, restoreScroll } = useSessionRestore();

  // Restore saved state on mount
  const [savedState] = useState<SavedState | null>(() => getSavedState());

  const [rawSearchInput, setRawSearchInput] = useState(savedState?.searchQuery || '');
  const [activeCategory, setActiveCategory] = useState<Category | null>(savedState?.activeCategory || null);
  const [readingMode, setReadingMode] = useState(false);

  const debouncedSearch = useDebounce(rawSearchInput, 300);

  const { articles, nextCursor, hasMore, loading, error, fetchMore, retry } = useArticleFeed({
    searchQuery: debouncedSearch,
    activeCategory,
    initialState: savedState ? {
      articles: savedState.articles,
      nextCursor: savedState.nextCursor,
      hasMore: savedState.hasMore,
    } : null,
  });

  const { activeArticleId, registerArticleRef } = useActiveArticle();

  // Sentinel for infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchMore]);

  // Update URL when active article changes
  useEffect(() => {
    if (activeArticleId) {
      navigate(`/read/${activeArticleId}`, { replace: true });
    }
  }, [activeArticleId, navigate]);

  // Save state on changes
  useEffect(() => {
    saveState({
      articles,
      nextCursor,
      hasMore,
      searchQuery: debouncedSearch,
      activeCategory,
    });
  }, [articles, nextCursor, hasMore, debouncedSearch, activeCategory, saveState]);

  // Restore scroll position on mount
  useEffect(() => {
    if (savedState?.scrollY) {
      restoreScroll(savedState.scrollY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save scroll position on scroll (debounced)
  useEffect(() => {
    let timer: number;
    const handleScroll = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        try {
          const raw = sessionStorage.getItem('article-reader-state');
          if (raw) {
            const state = JSON.parse(raw);
            state.scrollY = window.scrollY;
            sessionStorage.setItem('article-reader-state', JSON.stringify(state));
          }
        } catch { /* ignore */ }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`read-page${readingMode ? ' reading-mode' : ''}`}>
      <CrimsonHeader
        searchValue={rawSearchInput}
        onSearchChange={setRawSearchInput}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        readingMode={readingMode}
        onToggleReadingMode={() => setReadingMode(m => !m)}
      />

      <div className="layout">
        <Sidebar articles={articles} activeArticleId={activeArticleId} />

        <main className="read-content">
          {loading && articles.length === 0 && (
            <div className="loading-state">
              <div className="spinner" />
              Loading articles...
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
              <button onClick={retry}>Retry</button>
            </div>
          )}

          {articles.length === 0 && !loading && !error && (
            <div className="empty-state">
              {debouncedSearch
                ? <p>No articles found for &lsquo;{debouncedSearch}&rsquo;</p>
                : <p>No articles found.</p>
              }
            </div>
          )}

          <div className="articles-list">
            {articles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                isActive={article.id === activeArticleId}
                registerRef={registerArticleRef}
              />
            ))}
          </div>

          <div ref={sentinelRef} className="sentinel" />

          {loading && articles.length > 0 && (
            <div className="loading-more">
              <div className="spinner" />
              Loading more articles...
            </div>
          )}

          {!hasMore && articles.length > 0 && (
            <div className="end-state">You're all caught up!</div>
          )}
        </main>
      </div>
    </div>
  );
}
