/**
 * Type definitions for the Articles API
 */

export interface ArticleListItem {
  id: string;
  title: string;
  dek: string;
  author: string;
  publishedAt: string;
  readingTimeMins: number;
  imageUrl: string;
  contentHtml: string; // Full article content for rendering in the feed
}

export interface ArticleDetail {
  id: string;
  title: string;
  author: string;
  publishedAt: string;
  contentHtml: string;
}

export interface ArticlesListResponse {
  items: ArticleListItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ArticlesListParams {
  cursor?: string | null;
  limit?: number;
  q?: string | null;
}

export const CATEGORIES = [
  'Technology',
  'Science',
  'Business',
  'Health',
  'Culture',
  'Politics',
  'Environment',
  'Education',
] as const;

export type Category = (typeof CATEGORIES)[number];
