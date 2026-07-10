/** 作品一覧の1件。content/works.json に入る */
export interface Work {
  id: number;
  title: string;
  overview?: string;
  /** WorkCard が dangerouslySetInnerHTML で描画する。改行は <br /> で書く */
  description?: string;
  link?: string;
  images: string[];
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === "string");

/**
 * 1件を検証する。壊れた JSON を保存させるとサイトのビルドごと落ちる
 * @param work 検証する値
 * @param index 何件目か。エラーメッセージに使う
 */
function validateWork(work: any, index: number): Work {
  const at = `works[${index}]`;

  if (typeof work?.id !== "number") throw new Error(`${at}.id must be a number`);
  if (!work.title?.trim()) throw new Error(`${at}.title must not be empty`);
  if (!isStringArray(work.images)) throw new Error(`${at}.images must be an array of strings`);

  return work as Work;
}

/**
 * works.json を読んで検証する
 * @param source JSON の全文
 */
export function parseWorks(source: string): Work[] {
  const parsed = JSON.parse(source);
  if (!Array.isArray(parsed)) throw new Error("works.json must be an array");

  const works = parsed.map(validateWork);

  const ids = new Set(works.map(work => work.id));
  if (ids.size !== works.length) throw new Error("works[].id must be unique");

  return works;
}
