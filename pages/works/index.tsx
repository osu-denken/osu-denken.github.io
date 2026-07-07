import type { NextPage } from "next";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import styles from "@styles/Page.module.css";
import WorkCard from "../components/WorkCard";

// 作品データ
const WORKS = [
  {
    id: 1,
    title: "「カメラでドライブ！」",
    overview: "カメラから手で車を操作して障害物をよけるゲームです！",
    description: `
    電研1weekハッカソン 第一回で制作した作品です。<br /><br />
    開発元: チームAntigravity (3人)<br />
    使用技術: HTML/CSS/JS, Python/MediaPipe/OpenCV/FastAPI, Antigravity<br />
    制作期間: 2026/05/27〜2026/06/03
    `,
    link: "https://osu-denken.github.io/blog/2026/06/03/61.html",
    images: [
      "/image/works/drive-by-camera_1.jpg",
      "/image/works/drive-by-camera_2.jpg",
      "/image/works/drive-by-camera_3.jpg",
    ],
  },
  {
    id: 2,
    title: "「Motion Canvas Effects」",
    overview: "カメラから手の動きを読み取ってエネルギーのオーブを出して爆発させることができます！",
    description: `
    電研1weekハッカソン 第一回で制作した作品です。<br /><br />
    開発元: チームAntigravity (3人)<br />
    使用技術: HTML/CSS/JS, Python/MediaPipe/OpenCV/FastAPI, Antigravity<br />
    制作期間: 2026/05/27〜2026/06/03
    `,
    link: "https://osu-denken.github.io/blog/2026/06/03/61.html",
    images: [
      "/image/works/motion-canvas-effects_1.jpg",
      "/image/works/motion-canvas-effects_2.jpg",
    ],
  },
  {
    id: 3,
    title: "「phone ∧ shoot」",
    overview: "スマホを傾けて遊ぶシューティングゲームです！",
    description: `
    電研1weekハッカソン 第一回で制作した作品です。<br /><br />
    開発元: チームweii (3人)<br />
    使用技術: HTML/CSS/JS, JS/Node.js/Express, GitHub Copilot<br />
    制作期間: 2026/05/27〜2026/06/03
    `,
    link: "https://osu-denken.github.io/blog/2026/06/03/61.html",
    images: [
      "/image/works/phoneandshoot_1.jpg",
      "/image/works/phoneandshoot_2.jpg",
      "/image/works/phoneandshoot_3.jpg",
    ],
  },
  {
    id: 4,
    title: "タイピングゲーム",
    overview: "画面上の文字をタイプしていくゲームです！",
    description: `
    電研1weekハッカソン 第一回で制作した作品です。<br /><br />
    開発元: チーム高速情報処理 (3人)<br />
    制作期間: 2026/05/27〜2026/06/03
    `,
    link: "https://osu-denken.github.io/blog/2026/06/03/61.html",
    images: [
      "/image/works/typinggame.jpg",
    ],
  },
  {
    id: 5,
    title: "デジタル七夕",
    overview: "七夕に作成した願い事を吊るすウェブアプリです！",
    description: `
    部長が七夕に作成した作品です。<br /><br />
    開発元: 部長 (1人)<br />
    使用技術: HTML/CSS/JS<br />
    制作期間: 2026/07/07
    `,
    link: "https://osu-denken.github.io/blog/2026/07/07/119.html",
    images: [
      "https://osu-denken.github.io/blog/images/e6d107c0-e6bf-4daa-9d9d-90b1accb86d2.png",
    ],
  }
];

const WorksPage: NextPage = () => {
  
  // カルーセルの設定
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3000, stopOnInteraction: false })
  ]);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>作品</h1>
        <p className={styles.description}>
          部員が創作したものを紹介します！
        </p>

        {/* 作品の一覧リスト（縦並び、またはグリッド） */}
        <div className={styles.worksGrid}>
          {WORKS.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>

      </main>
    </div>
  );
};

export default WorksPage;