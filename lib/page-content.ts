import fs from "fs";
import path from "path";

/** ビルド時に読む固定ページ。編集はポータルから行い、コミットを経て反映される */
export interface PageContent {
  title: string;
  body: string;
}

const PAGES_DIR = path.join(process.cwd(), "content", "pages");

/**
 * front matter の title だけを取り出す。値を増やすならここを広げる
 * @param source Markdown の全文
 */
function splitFrontMatter(source: string): PageContent {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { title: "", body: source };

  const title = match[1].match(/^title:\s*(.*)$/m)?.[1]?.trim() ?? "";

  return {
    title: title.replace(/^["']|["']$/g, ""),
    body: source.slice(match[0].length)
  };
}

/**
 * 固定ページの Markdown を読む。getStaticProps からのみ呼ぶこと
 * @param slug ファイル名 (.md を除く)
 */
export function readPageContent(slug: string): PageContent {
  const source = fs.readFileSync(path.join(PAGES_DIR, `${slug}.md`), "utf8");
  return splitFrontMatter(source);
}
