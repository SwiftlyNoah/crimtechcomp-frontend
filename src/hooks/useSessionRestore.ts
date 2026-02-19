import { useCallback, useRef } from 'react';
import type { ArticleListItem, Category } from '../types';

const STORAGE_KEY = 'article-reader-state';

export interface SavedState {
  articles: ArticleListItem[];
  nextCursor: string | null;
  hasMore: boolean;
  searchQuery: string;
  activeCategory: Category | null;
  scrollY: number;
}

export function useSessionRestore() {
  const restoredRef = useRef(false);

  const getSavedState = useCallback((): SavedState | null => {
    if (restoredRef.current) return null;
    restoredRef.current = true;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SavedState;
    } catch {
      return null;
    }
  }, []);

  const saveState = useCallback((state: Omit<SavedState, 'scrollY'>) => {
    try {
      const toSave: SavedState = { ...state, scrollY: window.scrollY };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const restoreScroll = useCallback((scrollY: number) => {
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  }, []);

  return { getSavedState, saveState, restoreScroll };
}
