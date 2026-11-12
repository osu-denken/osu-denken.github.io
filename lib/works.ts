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
  /** 制作日・公開日など、作品が作成された日 */
  createdAt?: string;
  /** 最終更新日 */
  updatedAt?: string;
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
  { value: "fa-brands fa-instagram", label: "Instagram", icon: "fa6-brands:instagram" },
  { value: "fa-brands fa-steam", label: "Steam", icon: "fa6-brands:steam" },
  { value: "fa-brands fa-itch-io", label: "itch.io", icon: "fa6-brands:itch-io" },
  { value: "fa-brands fa-gitlab", label: "GitLab", icon: "fa6-brands:gitlab" },
  { value: "fa-solid fa-globe", label: "Webサイト", icon: "fa6-solid:globe" },
  { value: "fa-solid fa-video", label: "動画", icon: "fa6-solid:video" },
  { value: "fa-solid fa-play", label: "再生", icon: "fa6-solid:play" },
  { value: "fa-solid fa-pen-to-square", label: "編集・記事", icon: "fa6-solid:pen-to-square" },
  { value: "fa-solid fa-book-open", label: "資料・Wiki", icon: "fa6-solid:book-open" },
  { value: "fa-solid fa-download", label: "ダウンロード", icon: "fa6-solid:download" },
  { value: "fa-solid fa-link", label: "リンク", icon: "fa6-solid:link" },
] as const;

export const fontAwesomeIconName = (value?: string): string | undefined => {
  if (!value?.trim()) return undefined;

  const normalized = value.trim();
  const preset = WORK_ICON_OPTIONS.find(option => option.value === normalized);
  if (preset) return preset.icon;

  // Iconify 名はそのまま利用する。
  if (/^fa6-(solid|regular|brands):[a-z0-9-]+$/.test(normalized)) return normalized;

  // Font Awesome の class 名 (例: "fa fa-play", "fa-solid fa-pen-to-square") に対応する。
  const classes = normalized.split(/\s+/);
  const iconClass = classes.find(name => /^fa-[a-z0-9-]+$/.test(name) && !["fa-solid", "fa-regular", "fa-brands"].includes(name));
  if (!iconClass) return undefined;

  const style = classes.includes("fa-brands") || classes.includes("fab")
    ? "brands"
    : classes.includes("fa-regular") || classes.includes("far")
      ? "regular"
      : "solid";
  return `fa6-${style}:${iconClass.slice(3)}`;
};

/** 文字列配列かどうか */
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === "string");

/**
 * 1件を検証する。壊れた JSON を保存させるとサイトのビルドごと落ちる
 */
function validateWork(work: any, index: number, allowIncomplete: boolean): Work {
  const at = `works[${index}]`;

  if (typeof work?.id !== "number") throw new Error(`${at}.id must be a number`);
  if (typeof work.title !== "string" || (!allowIncomplete && !work.title.trim())) throw new Error(`${at}.title must not be empty`);
  if (!isStringArray(work.images)) throw new Error(`${at}.images must be an array of strings`);
  if (work.createdAt !== undefined && typeof work.createdAt !== "string") throw new Error(`${at}.createdAt must be a string`);
  if (work.updatedAt !== undefined && typeof work.updatedAt !== "string") throw new Error(`${at}.updatedAt must be a string`);
  if (work.tags !== undefined && !isStringArray(work.tags)) throw new Error(`${at}.tags must be an array of strings`);

  if (work.links !== undefined) {
    if (!Array.isArray(work.links)) throw new Error(`${at}.links must be an array`);
    work.links.forEach((link: any, linkIndex: number) => {
      const linkAt = `${at}.links[${linkIndex}]`;
      if (typeof link?.label !== "string") throw new Error(`${linkAt}.label must be a string`);
      if (typeof link?.url !== "string" || (!allowIncomplete && !link.url.trim())) throw new Error(`${linkAt}.url must not be empty`);
      if (link.icon !== undefined && typeof link.icon !== "string") throw new Error(`${linkAt}.icon must be a string`);
    });
  }

  return work as Work;
}

/** works.json を読んで検証する */
export function parseWorks(source: string, options: { allowIncomplete?: boolean } = {}): Work[] {
  const parsed = JSON.parse(source);
  if (!Array.isArray(parsed)) throw new Error("works.json must be an array");

  const works = parsed.map((work, index) => validateWork(work, index, options.allowIncomplete ?? false));
  const ids = new Set(works.map(work => work.id));
  if (ids.size !== works.length) throw new Error("works[].id must be unique");

  return works;
}


/** 保存前に編集中の空リンク行だけを除外し、ビルドに必要な形式を検証する */
export function parseWorksForSave(source: string): Work[] {
  const parsed = parseWorks(source, { allowIncomplete: true });
  const normalized = parsed.map(work => ({
    ...work,
    links: work.links?.filter(link => link.label.trim() || link.url.trim() || link.icon?.trim()),
  }));

  return parseWorks(JSON.stringify(normalized));
}
