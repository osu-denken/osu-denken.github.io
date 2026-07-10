import Link from "next/link";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { SITE_PAGES, sitePageHref } from "@lib/site-page";

// welcome.md はサイト本体ではなく fake terminal のファイルなので、ブログのエディタで開く
const terminalHref = "/portal/blog/?action=edit&page=%40welcome";

export const PageTab = () => (
  <div className={portalStyles.tabPane}>
    <h1>ページ</h1>
    <p className={styles.description}>
      公式サイト(ブログを除く)のページを編集します。<br />
      保存するとサイトが再ビルドされ、反映まで数分かかります。
    </p>

    <div className={portalStyles.grid}>
      {SITE_PAGES.map(page => (
        <Link key={page.path} href={sitePageHref(page.path)}>
          <div className={portalStyles.card}>
            <h3>{page.label}</h3>
            <p>{page.path}</p>
          </div>
        </Link>
      ))}
    </div>

    <p className={styles.description}>
      <Link href={terminalHref}>トップページのフェイクターミナルに表示される welcome.md を編集する</Link>
    </p>
  </div>
);
