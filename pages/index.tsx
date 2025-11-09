import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { Icon } from "@iconify/react";
import ParticleSpaceAnimationBackground from "./components/ParticleSpaceAnimationBackground";

const HomePage: NextPage = () => {

  return (
    <div className={styles.container}>
      <ParticleSpaceAnimationBackground />
      <main className={styles.main} style={{ position: 'relative', zIndex: 3 }}>
        <h1 className={styles.title}>電子計算研究部</h1>
        <h2 className={styles.bold}>大阪産業大学</h2>

        <div className={styles.iconContainer}>
          <a href="https://www.osaka-sandai.ac.jp/club_circle/club/233" title="大阪産業大学公式サイト">
            <Icon
              icon="mdi:university"
              width="2em"
              height="2em"
              style={{ color: "white" }}
            />
          </a>
          <a href="https://x.com/osu_denken" title="X (旧Twitter)">
            <Icon
              icon="mdi:twitter"
              width="2em"
              height="2em"
              style={{ color: "white" }}
            />
          </a>
          <a href="https://osu-denken.github.io/blog/2025/11/03/sandai-discord.html" title="Discordサーバーへの参加方法 (大産大生限定)">
            <Icon
              icon="mdi:discord"
              width="2em"
              height="2em"
              style={{ color: "white" }}
            />
          </a>
          <a href="https://github.com/osu-denken" title="GitHub">
            <Icon
              icon="mdi:github"
              width="2em"
              height="2em"
              style={{ color: "white" }}
            />
          </a>
        </div>

        <div className={styles.terminalContainer}>
        <iframe className={styles.terminal} src="./terminal.html"></iframe>
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

          <a href="./blog/faq" className={styles.card}>
            <h2>Q&A &rarr;</h2>
            <p>よくある質問、想定される質問を記載しています。</p>
          </a>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
