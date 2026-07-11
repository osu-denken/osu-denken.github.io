import type { NextPage } from "next";
import Link from "next/link";
import { useEffect } from "react";
import styles from "@styles/Page.module.css";

/**
 * 旧URL。招待コード登録ページは /register-by-code/ へ移設したので転送する。
 * 招待リンクの ?code= を引き継ぐためクエリとハッシュはそのまま渡す。
 */
const RegisterByCodeRedirect: NextPage = () => {
  useEffect(() => {
    window.location.replace("/register-by-code/" + window.location.search + window.location.hash);
  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <p className={styles.description}>
          登録ページは移動しました。自動で移動しない場合は{" "}
          <Link href="/register-by-code/">こちら</Link> を開いてください。
        </p>
      </main>
    </div>
  );
};

export default RegisterByCodeRedirect;
