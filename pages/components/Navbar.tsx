import Image from 'next/image';
import styles from '@styles/Navbar.module.css';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Modal from 'react-modal';
import { useAuth } from '@hooks/useAuth';
import LoginModal from '@components/LoginModal';

const Navbar: React.FC = () => {
  const [modalIsOpen, setIsOpen] = useState<boolean>(false);
  const { isLoggedIn, userName, login, logout } = useAuth();

  // URLの#loginハッシュに基づいてモーダルを開く
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#login') {
        setIsOpen(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash, false);
    return () => {
      window.removeEventListener('hashchange', checkHash, false);
    };
  }, []);

  // react-modalの初期設定
  useEffect(() => {
    // クライアントのみ
    if (typeof window !== 'undefined') {
      // .App要素が存在することを確認してから設定
      const appElement = document.querySelector('.App');
      if (appElement) {
        Modal.setAppElement('.App');
      }
    }
  }, []);
  
  const handleLogin = async (email: string, password: string) => {
    // ログイン成功時のリロードはuseAuth内で行われるため、ここではモーダルを閉じる処理は不要。
    // 失敗時はuseAuth内でalertが表示され、モーダルは開いたままとなる。
    await login(email, password);
  };
  
  const closeModal = () => {
    setIsOpen(false);
    // URLから#loginを削除
    if (typeof window !== 'undefined') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  // ログイン状態に応じたナビゲーションアイテム
  const rightNavItem = isLoggedIn ? (
    <>
      <li className={styles.right}>
        <Link href="/portal/">{userName}</Link>
      </li>
      <li>
        <a href="#logout" onClick={(e) => { e.preventDefault(); logout(); }}>
          ログアウト
        </a>
      </li>
    </>
  ) : (
    <>
      <li className={styles.right}>
        <a href="https://osu-denken.github.io/blog/join">入部</a>
      </li>
      <li>
        <a href="#login">ログイン</a>
      </li>
    </>
  );

  return (
    <nav className={styles.nav}>
      <ul>
        <li>
          <a href="https://osu-denken.github.io">
            <Image src="/icon.png" alt="電研ロゴ" width={30} height={30} />
            電研
          </a>
        </li>
        {rightNavItem}
      </ul>
      <LoginModal isOpen={modalIsOpen} onClose={closeModal} onLogin={handleLogin} />
    </nav>
  );
};

export default Navbar;
