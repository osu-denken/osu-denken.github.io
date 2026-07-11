import Modal from 'react-modal';
import { useState } from 'react';
import type { LoginResult } from '@hooks/useAuth';
import GoogleLoginButton from '@components/GoogleLoginButton';

const modalStyle: Modal.Styles = {
  overlay: {
    position: "fixed",
    zIndex: 10,
    top: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.25)"
  },
  content: {
    position: "relative",
    zIndex: 10,
    maxWidth: "20rem",
    minWidth: "16rem",
    minHeight: "16rem",
    backgroundColor: "#111111bf",
    border: "1px solid #23df1e",
    boxShadow: "0 0 3px #23df1eaa,0 0 6px #23df1eaa",
    borderRadius: "1rem",
    padding: "1.5rem",
    textAlign: "center",
  }
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 'mfa' が返ったら認証コードの入力へ進む */
  onLogin: (email: string, password: string) => Promise<LoginResult>;
  onLoginWithGoogle: (credential: string) => Promise<LoginResult>;
  onSubmitTotp: (code: string) => Promise<LoginResult>;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, onLoginWithGoogle, onSubmitTotp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [needsTotp, setNeedsTotp] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleGoogleCredential = async (credential: string) => {
    if (busy) return;
    setBusy(true);
    try {
      if (await onLoginWithGoogle(credential) === 'mfa') setNeedsTotp(true);
    } finally {
      setBusy(false);
    }
  };

  const handleLoginClick = async (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    try {
      if (await onLogin(email, password) === 'mfa') setNeedsTotp(true);
    } finally {
      setBusy(false);
    }
  };

  const handleTotpClick = async (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    try {
      // セッション切れなど、やり直しが必要な場合はパスワード入力へ戻す
      if (await onSubmitTotp(code) === 'error') setNeedsTotp(false);
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    setNeedsTotp(false);
    setCode('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      style={modalStyle}
      onRequestClose={handleClose}
      className="modalContent"
      overlayClassName="modalOverlay"
      closeTimeoutMS={200}
    >
      <button
        style={{
          position: "absolute",
          top: "0.5rem",
          right: "0.5rem",
          background: "transparent",
          border: "2px solid #23df1e",
          color: "#23df1e",
          fontSize: "1.5rem",
          width: "2rem",
          height: "2rem",
          borderRadius: "0.5rem",
          cursor: "pointer"
        }}
        onClick={handleClose}
      >
        ×
      </button>

      {needsTotp ? (
        <>
          <h2>2段階認証</h2>
          <form method="POST">
            <h3>認証コード</h3>
            <input
              type="text"
              name="one-time-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <br />
            <input type="submit" value="認証" disabled={busy} onClick={handleTotpClick} />
          </form>
          <p>
            認証アプリに表示されている6桁のコードを入力してください。<br />
            端末を紛失した場合はリカバリコードも使えます。
          </p>
        </>
      ) : (
        <>
          <h2>ログイン</h2>
          <form method="POST">
            <h3>学籍番号</h3>
            <input
              type="text"
              name="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            /><br />
            <h3>パスワード</h3>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <input type="submit" value="ログイン" disabled={busy} onClick={handleLoginClick} />
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', margin: '1rem 0' }}>
            <span style={{ color: '#aaa', fontSize: '0.85rem' }}>または</span>
            <GoogleLoginButton onCredential={handleGoogleCredential} />
          </div>

          <p>
            ログインは大産大の電研部員のみが可能となっております。<br />
            はじめての方は大学 Google アカウントでログインしてください。
          </p>
        </>
      )}
    </Modal>
  );
};

export default LoginModal;
