// web-api の util/private-post.ts と一致させること
export interface PrivatePostSummary {
  id: number;
  slug: string;
  title: string;
  authorId: number;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrivatePost extends PrivatePostSummary {
  content: string;
}

export const privatePostHref = (slug: string) =>
  `/portal/private/?page=${encodeURIComponent(slug)}`;

/**
 * 新規記事のスラッグの既定値 (例: 2026-07-10-a1b2c3)
 */
export const defaultSlug = () => {
  const today = new Date().toISOString().split("T")[0];
  return `${today}-${crypto.randomUUID().slice(0, 6)}`;
};
