import Modal from 'react-modal';
import { useState } from 'react';

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
  onLogin: (email: string, password: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <Modal
      isOpen={isOpen}
      style={modalStyle}
      onRequestClose={onClose}
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
        onClick={onClose}
      >
        ×
      </button>
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
        <input type="submit" value="ログイン" onClick={handleLoginClick} />
      </form>
      <p>
        ログインは大産大の電研部員のみが可能となっております。
      </p>
    </Modal>
  );
};

export default LoginModal;
