import styles from '../../styles/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.wrapper}>
        <h2 className={styles.footerHeading}>電研HP</h2>

        <div className={styles.footerColWrapper}>
          <div className={`${styles.footerCol} ${styles.footerCol1}`}>
            <ul className={styles.contactList}>
              <li>大阪産業大学文化会 電子計算研究部</li>
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
