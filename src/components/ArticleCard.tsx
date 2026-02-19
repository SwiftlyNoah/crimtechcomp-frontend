import { useCallback } from 'react';
import type { ArticleListItem } from '../types';

interface ArticleCardProps {
  article: ArticleListItem;
  isActive: boolean;
  registerRef: (id: string, el: HTMLElement | null) => void;
}

export default function ArticleCard({ article, isActive, registerRef }: ArticleCardProps) {
  const refCallback = useCallback(
    (el: HTMLElement | null) => registerRef(article.id, el),
    [article.id, registerRef]
  );

  return (
    <article
      ref={refCallback}
      data-article-id={article.id}
      className={`article-card${isActive ? ' article-active' : ''}`}
    >
      <img
        src={article.imageUrl}
        alt={article.title}
        className="article-image"
        loading="lazy"
      />
      <h2>{article.title}</h2>
      <p className="article-dek">{article.dek}</p>
      <div className="article-meta">
        <span>By {article.author}</span>
        <span>&middot;</span>
        <span>{article.readingTimeMins} min read</span>
        <span>&middot;</span>
        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
      </div>
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />
    </article>
  );
}
