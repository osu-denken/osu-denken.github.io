import type { NextPage } from "next";
import Link from "next/link";
import { useEffect } from "react";
import styles from "@styles/Page.module.css";

/**
 * 旧URL。入部申請ページは /register/ へ移設したので転送する。
 * クエリ (?email= など) とハッシュは引き継ぐ。
 */
const JoinRedirect: NextPage = () => {
  useEffect(() => {
    window.location.replace("/register/" + window.location.search + window.location.hash);
  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <p className={styles.description}>
          入部申請ページは移動しました。自動で移動しない場合は{" "}
          <Link href="/register/">こちら</Link> を開いてください。
        </p>
      </main>
    </div>
  );
};

export default JoinRedirect;
