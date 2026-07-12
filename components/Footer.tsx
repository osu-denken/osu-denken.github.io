import styles from '@styles/Footer.module.css';
import Link from 'next/link';
import { Icon } from '@iconify/react';

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
            <p style={{ marginTop: '-0.8em' }}>
              <a href="https://osu-denken.github.io/"><img src="/banner.png" width="88" height="31" alt="電研バナー"/></a>
            </p>
          </div>

          <div className={`${styles.footerCol} ${styles.footerCol2} ${styles.footerIcons}`}>
            <a href="/denken-pub.asc" title="PGP公開鍵" aria-label="PGP公開鍵">
              <Icon icon="fa6-solid:key" />
            </a>
            <a href="/feed.xml" type="application/rss+xml" title="RSS" aria-label="RSS">
              <Icon icon="fa6-solid:rss" />
            </a>
          </div>
        </div>
        <div className={styles.copyright}>
          © 2025-2026 Processing of Information Club at Osaka Sangyo University, Code: MIT License / Image: CC BY 4.0
        </div>
      </div>
    </footer>
  );
};

export default Footer;
