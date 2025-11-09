import Image from "next/image";
import styles from "../../styles/Navbar.module.css";
import Modal from "react-modal";
import { useState, useEffect } from "react";

const modalStyle: Modal.Styles = {
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

const Navbar: React.FC = () => {
  const [modalIsOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('.App');
    }
  }, []);

  return (
    <nav className={styles.nav}>
      <ul>
        <li>
          <a href="https://osu-denken.github.io">
            <Image src="/icon.png" alt="電研ロゴ" width={30} height={30} />
            電研
          </a>
        </li>
        <li className={styles.right}>
          <a href="https://osu-denken.github.io/blog/join">入部</a>
        </li>
        {/* <li className={styles.rightend}>
          <a onClick={() => setIsOpen(true)}>Login</a>
        </li> */}
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
};

export default Navbar;
