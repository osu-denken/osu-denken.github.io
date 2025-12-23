import type { NextPage } from "next";
import styles from "@styles/Home.module.css";
import { Icon } from "@iconify/react";
import ParticleSpaceAnimationBackground from "@components/ParticleSpaceAnimationBackground";

const SOCIAL_LINKS = [
  {
    href: "https://www.osaka-sandai.ac.jp/club_circle/club/233",
    title: "大阪産業大学公式サイト",
    icon: "mdi:university",
  },
  {
    href: "https://x.com/osu_denken",
    title: "X (旧Twitter)",
    icon: "mdi:twitter",
  },
  {
    href: "https://osu-denken.github.io/blog/2025/11/03/sandai-discord.html",
    title: "Discordサーバーへの参加方法 (大産大生限定)",
    icon: "mdi:discord",
  },
  {
    href: "https://github.com/osu-denken",
    title: "GitHub",
    icon: "mdi:github",
  },
];

const LINK_CARDS = [
  {
    href: "./about/",
    title: "紹介",
    description: "電子計算研究部についての大まかな紹介です。",
  },
  {
    href: "./works/",
    title: "作品",
    description: "創作したものを記載しているページです。",
  },
  {
    href: "./blog/",
    title: "ブログ",
    description: "電研のメンバーが記述する記事をまとめたものです。",
  },
  {
    href: "./blog/faq",
    title: "Q&A",
    description: "よくある質問、想定される質問を記載しています。",
  },
];


const HomePage: NextPage = () => {

  return (
    <div className={styles.container}>
      <ParticleSpaceAnimationBackground />
      <main className={styles.main} style={{ position: 'relative', zIndex: 3 }}>
        <h1 className={styles.title}>電子計算研究部</h1>
        <h2 className={styles.subtitle}><img src="osaka-sandai-kawaii-logo-transparent-resize.png" alt="大阪産業大学" title="大阪産業大学" /></h2>
        {/* <h2 className={styles.bold}>大阪産業大学</h2> */}

        <div className={styles.iconContainer}>
          {SOCIAL_LINKS.map((link) => (
            <a href={link.href} title={link.title} target="_blank" key={link.href} rel="noopener noreferrer">
              <Icon
                icon={link.icon}
                width="2em"
                height="2em"
                style={{ color: "white" }}
              />
            </a>
          ))}
        </div>

        <div className={styles.terminalContainer}>
          <iframe className={styles.terminal} src="./terminal/main.html"></iframe>
        </div>

        <div className={styles.grid}>
          {LINK_CARDS.map((card) => (
            <a href={card.href} className={styles.card} key={card.href}>
              <h2>{card.title} &rarr;</h2>
              <p>{card.description}</p>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
