import { useState, useEffect, useCallback, useRef } from 'react';

export function useActiveArticle() {
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const articleRefs = useRef(new Map<string, HTMLElement>());
  const ratios = useRef(new Map<string, number>());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const id = entry.target.getAttribute('data-article-id');
          if (id) {
            ratios.current.set(id, entry.intersectionRatio);
          }
        });

        // Find article with highest intersection ratio
        let maxRatio = 0;
        let maxId: string | null = null;
        ratios.current.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            maxId = id;
          }
        });

        if (maxId) {
          setActiveArticleId(maxId);
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1.0] }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const registerArticleRef = useCallback((id: string, element: HTMLElement | null) => {
    const observer = observerRef.current;
    if (!observer) return;

    const existing = articleRefs.current.get(id);
    if (existing) {
      observer.unobserve(existing);
    }

    if (element) {
      articleRefs.current.set(id, element);
      observer.observe(element);
    } else {
      articleRefs.current.delete(id);
      ratios.current.delete(id);
    }
  }, []);

  return { activeArticleId, registerArticleRef };
}
