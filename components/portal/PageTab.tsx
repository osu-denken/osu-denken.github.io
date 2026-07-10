import Link from "next/link";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";

// ページの編集はブログとは別のもの。ブログと同じエディタを使うだけ
const editorHref = (page: string) => `/portal/blog/?action=edit&page=${encodeURIComponent(page)}`;

export const PageTab = () => (
  <div className={portalStyles.tabPane}>
    <h1>ページ</h1>
    <p className={styles.description}>
      公式サイト(ブログを除く)のページを編集します。
    </p>

    <p className={styles.description}>
      <Link href={editorHref("@welcome")}>トップページのターミナルに表示される welcome.md を編集する</Link>
    </p>
  </div>
);
