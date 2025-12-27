import type { NextPage } from "next";
import Image from "next/image";
import styles from "../styles/Top.module.css";
import { Icon } from "@iconify/react";

const TopPage: NextPage = () => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>電子計算研究部</h1>
        <h2 className={styles.bold}>大阪産業大学</h2>

        <p className={styles.description}>
          パソコン、ネットワーク、ゲーム、プログラミングといった活動をしている大産大のクラブです。
        </p>

        <div className={styles.iconContainer}>
          <a href="https://www.osaka-sandai.ac.jp/club_circle/club/233">
            <Icon
              icon="mdi:university"
              width="2em"
              height="2em"
              style={{ color: "404040" }}
            />
          </a>
          <a href="https://x.com/osu_denken">
            <Icon
              icon="mdi:twitter"
              width="2em"
              height="2em"
              style={{ color: "404040" }}
            />
          </a>
          <a href="https://github.com/osu-denken">
            <Icon
              icon="mdi:github"
              width="2em"
              height="2em"
              style={{ color: "404040" }}
            />
          </a>
        </div>

        <div className={styles.grid}>
          <a href="./about/" className={styles.card}>
            <h2>紹介 &rarr;</h2>
            <p>電子計算研究部についての大まかな紹介です。</p>
          </a>

          <a href="./works/" className={styles.card}>
            <h2>作品 &rarr;</h2>
            <p>創作したものを記載しているページです。</p>
          </a>

          <a href="./blog/" className={styles.card}>
            <h2>ブログ &rarr;</h2>
            <p>電研のメンバーが記述する記事をまとめたものです。</p>
          </a>

          <a
            href="./other/"
            className={styles.card}
          >
            <h2>その他 &rarr;</h2>
            <p>これらに該当しないものを記載する予定です。</p>
          </a>
        </div>
      </main>
    </div>
  );
};

export default TopPage;
