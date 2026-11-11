/** 作品一覧の1件。content/works.json に入る */
export interface WorkLink {
  label: string;
  url: string;
  /** Font Awesome のスタイル・アイコン名。例: fa-brands fa-github */
  icon?: string;
}

export interface Work {
  id: number;
  title: string;
  overview?: string;
  /** WorkCard が dangerouslySetInnerHTML で描画する。改行は <br /> で書く */
  description?: string;
  category?: string;
  tags?: string[];
  author?: string;
  links?: WorkLink[];
  images: string[];
}

/** 編集画面で選べる Font Awesome 6 アイコン */
export const WORK_ICON_OPTIONS = [
  { value: "fa-brands fa-github", label: "GitHub", icon: "fa6-brands:github" },
  { value: "fa-brands fa-youtube", label: "YouTube", icon: "fa6-brands:youtube" },
  { value: "fa-brands fa-x-twitter", label: "X", icon: "fa6-brands:x-twitter" },
  { value: "fa-brands fa-discord", label: "Discord", icon: "fa6-brands:discord" },
  { value: "fa-solid fa-globe", label: "Webサイト", icon: "fa6-solid:globe" },
  { value: "fa-solid fa-video", label: "動画", icon: "fa6-solid:video" },
  { value: "fa-solid fa-download", label: "ダウンロード", icon: "fa6-solid:download" },
  { value: "fa-solid fa-link", label: "リンク", icon: "fa6-solid:link" },
] as const;

export const fontAwesomeIconName = (value?: string): string | undefined =>
  WORK_ICON_OPTIONS.find(option => option.value === value)?.icon;

/** 文字列配列かどうか */
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === "string");

/**
 * 1件を検証する。壊れた JSON を保存させるとサイトのビルドごと落ちる
 */
function validateWork(work: any, index: number): Work {
  const at = `works[${index}]`;

  if (typeof work?.id !== "number") throw new Error(`${at}.id must be a number`);
  if (typeof work.title !== "string" || !work.title.trim()) throw new Error(`${at}.title must not be empty`);
  if (!isStringArray(work.images)) throw new Error(`${at}.images must be an array of strings`);
  if (work.tags !== undefined && !isStringArray(work.tags)) throw new Error(`${at}.tags must be an array of strings`);

  if (work.links !== undefined) {
    if (!Array.isArray(work.links)) throw new Error(`${at}.links must be an array`);
    work.links.forEach((link: any, linkIndex: number) => {
      const linkAt = `${at}.links[${linkIndex}]`;
      if (typeof link?.label !== "string" || !link.label.trim()) throw new Error(`${linkAt}.label must not be empty`);
      if (typeof link?.url !== "string" || !link.url.trim()) throw new Error(`${linkAt}.url must not be empty`);
      if (link.icon !== undefined && typeof link.icon !== "string") throw new Error(`${linkAt}.icon must be a string`);
    });
  }

  return work as Work;
}

/** works.json を読んで検証する */
export function parseWorks(source: string): Work[] {
  const parsed = JSON.parse(source);
  if (!Array.isArray(parsed)) throw new Error("works.json must be an array");

  const works = parsed.map(validateWork);
  const ids = new Set(works.map(work => work.id));
  if (ids.size !== works.length) throw new Error("works[].id must be unique");

  return works;
}
