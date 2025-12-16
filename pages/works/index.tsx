import type { NextPage } from "next";
import styles from "@styles/Page.module.css";

const AboutPage : NextPage = () => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>作品</h1>
        <p className={styles.description}>
          部員が創作したものを記載する予定です。
        </p>


      </main>
    </div>
  );
};

export default AboutPage;