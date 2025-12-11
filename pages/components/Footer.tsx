import styles from '@styles/Footer.module.css';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.wrapper}>
        <h2 className={styles.footerHeading}>電研公式サイト</h2>

        <div className={styles.footerColWrapper}>
          <div className={`${styles.footerCol} ${styles.footerCol1}`}>
            <ul className={styles.contactList}>
              <li><Link href="https://www.osaka-sandai.ac.jp/" target='_blank'>大阪産業大学</Link> 文化会 電子計算研究部</li>
            </ul>
          </div>

          <div className={`${styles.footerCol} ${styles.footerCol2}`}>
            <p>
              <a href="/denken-pub.asc">
                PGP公開鍵
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
