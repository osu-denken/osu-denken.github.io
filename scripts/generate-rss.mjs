// 公式サイトの RSS フィード (public/feed.xml) を作品一覧から生成する。
// output: export では API ルートが使えないため、ビルド前にこのスクリプトで
// 静的ファイルを吐き出しておき、public/ 経由で配信する。
import fs from "node:fs";
import path from "node:path";

const SITE_URL = "https://osu-denken.github.io";
const SITE_TITLE = "大阪産業大学 電子計算研究部";
const SITE_DESCRIPTION =
  "大阪産業大学 文化会 電子計算研究部の公式サイト。部員が制作した作品を紹介しています。";

const root = process.cwd();
const worksPath = path.join(root, "content", "works.json");
const outPath = path.join(root, "public", "feed.xml");

/** XML の特殊文字をエスケープする */
function xmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const works = JSON.parse(fs.readFileSync(worksPath, "utf8"));
const buildDate = new Date().toUTCString();

const items = works
  .map((work) => {
    const link = work.link || `${SITE_URL}/works/`;
    // description は <br /> 等の HTML を含むため CDATA で包む
    const summary = work.overview || work.description || work.title;
    return `    <item>
      <title>${xmlEscape(work.title)}</title>
      <link>${xmlEscape(link)}</link>
      <guid isPermaLink="false">osu-denken-work-${work.id}</guid>
      <description><![CDATA[${summary}]]></description>
    </item>`;
  })
  .join("\n");

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(SITE_TITLE)} - 作品一覧</title>
    <link>${SITE_URL}/works/</link>
    <description>${xmlEscape(SITE_DESCRIPTION)}</description>
    <language>ja</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${buildDate}</lastBuildDate>
${items}
  </channel>
</rss>
`;

fs.writeFileSync(outPath, rss, "utf8");
console.log(`Generated ${path.relative(root, outPath)} (${works.length} items)`);
