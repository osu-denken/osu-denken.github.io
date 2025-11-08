import type { NextPage } from "next";
import styles from "../../styles/Page.module.css";

const AboutPage : NextPage = () => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>電研について</h1>
        <p className={styles.description}>
          電子計算研究部（通称：電研、Denken）は大阪産業大学のコンピュータ系の部活です。<br />
          パソコン、ネットワーク、ゲーム、プログラミングといった活動を通じて、技術力の向上や部員同士との交流を深めています。<br />
          <br />
          年に一度、パソコンの組立てを行います。<br />
          また、大学祭 (阪駒祭) では、部員が開発したプログラムやゲーム体験、パソコン組立て体験、コンピュータ/サーバーなどの機器の展示を行っています。<br />
        </p>
      </main>
    </div>
  );
};

export default AboutPage;