import Image from 'next/image';
import styles from '@styles/Navbar.module.css';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { apiFetch } from '@lib/api';
import { hasPermission, Permission } from '@lib/member';
import Modal from 'react-modal';
import { useAuth } from '@hooks/useAuth';
import LoginModal from '@components/LoginModal';

const Navbar: React.FC = () => {
  const [modalIsOpen, setIsOpen] = useState<boolean>(false);
  const [canEditWorks, setCanEditWorks] = useState(false);
  const router = useRouter();
  const { isLoggedIn, userName, login, loginWithGoogle, submitTotp, logout } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) { setCanEditWorks(false); return; }
    let cancelled = false;
    apiFetch('/portal', { method: 'POST' })
      .then(async response => {
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setCanEditWorks(hasPermission(data.permissions ?? 0, Permission.PageEdit));
      })
      .catch(error => console.error('Failed to load works permission:', error));
    return () => { cancelled = true; };
  }, [isLoggedIn]);

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
  
  // ログイン成功時のリロードはuseAuth内で行われるため、ここではモーダルを閉じる処理は不要。
  // 失敗時はuseAuth内でalertが表示され、モーダルは開いたままとなる。
  const handleLogin = (email: string, password: string) => login(email, password);
  
  const closeModal = () => {
    setIsOpen(false);
    // URLから#loginを削除
    if (typeof window !== 'undefined') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  // ログイン状態に応じたナビゲーションアイテム
  const showWorksAdd = router.pathname === '/works' && isLoggedIn && canEditWorks;

  const rightNavItem = isLoggedIn ? (
    <>
      <li className={showWorksAdd ? undefined : styles.right}>
        <Link href="/portal/">{userName}</Link>
      </li>
      <li>
        <a href="#logout" onClick={(e) => { 
          e.preventDefault();
          logout();
        }}>
          ログアウト
        </a>
      </li>
    </>
  ) : (
    <>
      <li className={styles.right}>
        <Link href="/register/">入部</Link>
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
        {showWorksAdd && (
          <li className={styles.right}>
            <Link href="/portal/page/?path=content%2Fworks.json&new=1" className={styles.navAction}>
              <Icon icon="fa6-solid:plus" />作品追加
            </Link>
          </li>
        )}
        {rightNavItem}
      </ul>
      <LoginModal isOpen={modalIsOpen} onClose={closeModal} onLogin={handleLogin} onLoginWithGoogle={loginWithGoogle} onSubmitTotp={submitTotp} />
    </nav>
  );
};

export default Navbar;
