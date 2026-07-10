// web-api の service/github.ts の SITE_EDITABLE_FILES と一致させること
export interface SitePage {
  path: string;
  label: string;
  /** works だけは Markdown ではなく作品リストの JSON */
  kind: "markdown" | "works";
}

export const SITE_PAGES: readonly SitePage[] = [
  { path: "content/pages/about.md", label: "電研について (/about/)", kind: "markdown" },
  { path: "content/pages/access.md", label: "アクセス (/access/)", kind: "markdown" },
  { path: "content/works.json", label: "作品 (/works/)", kind: "works" },
];

export const sitePageOf = (path: string): SitePage | undefined =>
  SITE_PAGES.find(page => page.path === path);

export const sitePageHref = (path: string) =>
  `/portal/page/?path=${encodeURIComponent(path)}`;
