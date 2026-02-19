import type { ArticleListItem } from '../types';

interface SidebarProps {
  articles: ArticleListItem[];
  activeArticleId: string | null;
}

export default function Sidebar({ articles, activeArticleId }: SidebarProps) {
  const scrollToArticle = (id: string) => {
    const el = document.querySelector(`[data-article-id="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside className="sidebar">
      <h3>Articles</h3>
      <ul>
        {articles.map(article => (
          <li
            key={article.id}
            className={article.id === activeArticleId ? 'active' : ''}
            onClick={() => scrollToArticle(article.id)}
          >
            {article.title}
          </li>
        ))}
      </ul>
    </aside>
  );
}
