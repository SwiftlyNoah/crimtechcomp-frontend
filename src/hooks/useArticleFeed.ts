import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchArticles } from '../api/client';
import type { ArticleListItem, Category } from '../types';

export interface ArticleFeedState {
  articles: ArticleListItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface UseArticleFeedOptions {
  searchQuery: string;
  activeCategory: Category | null;
  initialState?: ArticleFeedState | null;
}

export function useArticleFeed({ searchQuery, activeCategory, initialState }: UseArticleFeedOptions) {
  const [articles, setArticles] = useState<ArticleListItem[]>(initialState?.articles || []);
  const [nextCursor, setNextCursor] = useState<string | null>(initialState?.nextCursor ?? null);
  const [hasMore, setHasMore] = useState(initialState?.hasMore ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  // Track params we already have data for to avoid redundant fetches (handles StrictMode double-effects)
  const lastFetchParamsRef = useRef<{ query: string; category: Category | null } | null>(
    initialState ? { query: searchQuery, category: activeCategory } : null
  );
  const versionRef = useRef(0);

  const doFetch = useCallback(async (cursor: string | null, query: string, category: Category | null) => {
    // Guard loadMore (cursor !== null) against double-calls; resets always proceed
    if (cursor !== null && loadingRef.current) return;

    const version = ++versionRef.current;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Build API query param
      let apiQuery: string | null = null;
      if (query && category) {
        // Both active: search via API, filter category client-side
        apiQuery = query;
      } else if (query) {
        apiQuery = query;
      } else if (category) {
        apiQuery = category;
      }

      console.log(`[API] Fetching articles — cursor: ${cursor}, query: ${apiQuery}`);

      const response = await fetchArticles({ cursor, limit: 10, q: apiQuery });

      // Ignore stale responses
      if (version !== versionRef.current) return;

      let items = response.items;

      // Client-side category filter when both search and category are active
      if (query && category) {
        items = items.filter(a =>
          a.title.toLowerCase().includes(category.toLowerCase())
        );
      }

      setArticles(prev => cursor ? [...prev, ...items] : items);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (err) {
      if (version !== versionRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      if (version === versionRef.current) {
        setLoading(false);
        loadingRef.current = false;
      }
    }
  }, []);

  // Fetch on mount or when search/category changes
  useEffect(() => {
    const last = lastFetchParamsRef.current;
    if (last !== null && last.query === searchQuery && last.category === activeCategory) {
      return;
    }
    lastFetchParamsRef.current = { query: searchQuery, category: activeCategory };
    setArticles([]);
    setNextCursor(null);
    setHasMore(true);
    doFetch(null, searchQuery, activeCategory);
  }, [searchQuery, activeCategory, doFetch]);

  const fetchMore = useCallback(() => {
    if (hasMore && !loadingRef.current && nextCursor) {
      doFetch(nextCursor, searchQuery, activeCategory);
    }
  }, [hasMore, nextCursor, searchQuery, activeCategory, doFetch]);

  const retry = useCallback(() => {
    doFetch(null, searchQuery, activeCategory);
  }, [searchQuery, activeCategory, doFetch]);

  return { articles, nextCursor, hasMore, loading, error, fetchMore, retry };
}
