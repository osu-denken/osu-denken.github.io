import Link from "next/link";
import styles from "../../styles/Navbar.module.css";
import Modal from "react-modal";
import { useState } from "react";

Modal.setAppElement(".App");

const modalStyle = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.85)"
  },
  content: {
    position: "absolute",
    top: "5rem",
    left: "5rem",
    right: "5rem",
    bottom: "5rem",
    backgroundColor: "white",
    borderRadius: "1rem",
    padding: "1.5rem"
  }
};

export default function Navbar() {
  const [modalIsOpen, setIsOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <ul>
        <li>
          <Link href="https://osu-denken.github.io">電研</Link>
        </li>
        <li className={styles.right}>
          <a onClick={() => setIsOpen(true)}>ログイン</a>
        </li>
        {/* <li className={styles.right}>
          <a>設定</a>
        </li> */}
      </ul>
        <Modal isOpen={modalIsOpen} style={modalStyle} onRequestClose={() => setIsOpen(false)}>
        <button onClick={() => setIsOpen(false)}>閉じる</button>
        <form method="POST">
          <input type="text" name="username" /><br />
          <input type="password" name="password" />
          <br />
          <input type="submit" />
        </form>
      </Modal>
    </nav>
  );
}
