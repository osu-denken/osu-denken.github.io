import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import Link from "next/link";

const AboutPage : NextPage = () => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>アクセス</h1>
        <p className={styles.description}>
          電子計算研究部の部室は、大阪府大東市中垣内4丁目5 大阪産業大学 南キャンパス 学生会館ACT Sta.(アクトス) 6階 部室8となります。
        </p>

        <h2>大学へのアクセス</h2>
        <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d6559.79310933461!2d135.643652!3d34.707789!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x600121d49f1fbdfd%3A0x5734c612a936ca81!2z5aSn6Ziq55Sj5qWt5aSn5a2m!5e0!3m2!1sja!2sjp!4v1765945349040!5m2!1sja!2sjp" width="400" height="300" style={{border:0}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>

        <p className={styles.description}>
          大阪産業大学へのアクセス方法の詳細は以下の大学公式サイトからご覧ください。<br />
          <Link href="https://www.osaka-sandai.ac.jp/access/access.html">https://www.osaka-sandai.ac.jp/access/access.html</Link>
        </p>

        <h2>部室へのアクセス</h2>
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d487.5639611901969!2d135.64075920083081!3d34.7070388583328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x600121001a2e2f4f%3A0xff11c0497681af09!2z5a2m55Sf5Lya6aSoIEFDVCBTdGE!5e0!3m2!1sja!2sjp!4v1765945851783!5m2!1sja!2sjp" width="400" height="300" style={{border:0}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>

        <p className={styles.description}>
          学生会館(ACT Sta.)には南キャンパスの門を経由して1階へ、もしくは中央キャンパスの5号館裏側の手前にある連絡ブリッジ(サンブリッジ)を経由して3階へ直接入ることができます。<br />
          左右の部屋はそれぞれ模型製作同好会と学生自治会となります。
        </p>
      </main>
    </div>
  );
};

export default AboutPage;