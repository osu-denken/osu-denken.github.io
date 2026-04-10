import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import Link from "next/link";

const AboutPage : NextPage = () => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>電子計算研究部@大阪産業大学</h1>
        <p className={styles.description}>
          電子計算研究部（通称：電研、Denken）は大阪産業大学のコンピュータ系の部活。<br />
          英名は Processing of Information Club (Electronic Computing Research Division) です。
        </p>

        <ul>
          <li>パソコン、ゲーム、プログラミングなどの活動を通じて技術力向上</li>
          <li>部員同士との交流を深める</li>
          <li>年に一度パソコンの組立てを実施</li>
          <li>大学祭（阪駒祭）では、プログラムやゲーム体験、パソコン組立て体験、コンピュータ/サーバーなどの展示</li>
        </ul>

        <p className={styles.description}>
          自由参加ですので、ぜひ空きコマに活用してみてください！パソコンを持っていない、わからない方ももちろん歓迎！<br />
          <br />
          電子計算研究部は昭和43年6月10日に創部され、2018年には創立50周年を迎えました。
        </p>

        <h2>設備</h2>
        <img src="https://osu-denken.github.io/blog/images/2025-11-06-FLATRON-24EA53VQ-P.png" style={{maxWidth: "400px"}} />

        <p className={styles.description}>
          ゲーミングPCやサーバーなどがあり、Windows、Mac、Linuxなども利用できます<br />
          ぜひ、プログラミングやゲームに活用してみてはいかがでしょうか？<br /><br />

          部室にあるコンピュータや周辺機器などの詳細は <a href="/blog/2025/11/05/equipments.html">部室の機器など | 電研ブログ</a> で記載しています。<br />

        </p>

        <h2>年間スケジュール</h2>
        <iframe src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Asia%2FTokyo&showPrint=0&showTz=0&showTitle=0&showTabs=0&showCalendars=0&src=ZTg5NGMxOWUwYjQ3NGY0YjdjNWQxYjVmNmE1MDA0Yjk3YjE3ZDAxYjM0YTExOTdiODcxMzUwZTgwZWI0ZDQzMEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23039be5" style={{borderWidth: "0px", filter: "invert(1) hue-rotate(180deg)", maxWidth: 960, minHeight: 300, width: "100%"}} width="800" height="600" frameBorder="0" scrolling="no"></iframe>
        <p className={styles.description}>
          このカレンダーは3ヶ月分の予定を表示しています。
        </p>

        <h2>アクセス</h2>
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d487.5639611901969!2d135.64075920083081!3d34.7070388583328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x600121001a2e2f4f%3A0xff11c0497681af09!2z5a2m55Sf5Lya6aSoIEFDVCBTdGE!5e0!3m2!1sja!2sjp!4v1765945851783!5m2!1sja!2sjp" width="400" height="300" style={{border:0}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        <p className={styles.description}>
          部室は、大阪産業大学の南キャンパスにある学生会館 (ACT Sta.) 6階 部室8 です。<br />
          詳細は<Link href="/access/">こちら</Link>をご覧ください。
        </p>

        <h2>Webサイト</h2>
        <p className={styles.description}>
          このサイトは、電研の部員自身が制作した公式ウェブサイトです。
        </p>

        <ul>
          <li>ホスティング: GitHub Pages</li>
          <li>フロントエンド: Next.js + TypeScript</li>
          <li>バックエンド: Cloudflare Workers + TypeScript, Firebase</li>
          <li>ブログ: Jekyll</li>
        </ul>
      </main>
    </div>
  );
};

export default AboutPage;