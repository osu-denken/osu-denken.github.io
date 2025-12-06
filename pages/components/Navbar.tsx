import Image from "next/image";
import styles from "../../styles/Navbar.module.css";
import Modal from "react-modal";
import { useState, useEffect } from "react";

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

const Navbar: React.FC = () => {
  const [modalIsOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('.App');
    }
  }, []);

  // onclick
  const handleLogin = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    //alert("ログイン処理が実行されました。");
    // https://api.osudenken4dev.workers.dev/user/login POST email password
    const form = e.currentTarget.form;
    if (!form) return;
    const formData = new FormData(form);
    const username = formData.get("username");
    const password = formData.get("password");

    fetch("https://api.osudenken4dev.workers.dev/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: username,
        password: password
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log("data:", data);
        if (data.idToken) {
          localStorage.setItem("idToken", data.idToken);
          alert("ログインに成功しました");
          setIsOpen(false);
        } else {
          alert("ログイン失敗: " + data.message);
        }
      })
      .catch(error => {
        console.error("Error:", error);
        alert("ログイン中にエラーが発生しました。");
      });
  }

  let loginNav = (
    <li className={styles.rightend}>
      <a onClick={() => setIsOpen(true)}>ログイン</a>
    </li>
  );

  if (typeof window !== 'undefined' && localStorage.getItem("idToken")) {
    loginNav = (
      <li className={styles.rightend}>
        <a onClick={
          () => {
            localStorage.removeItem("idToken");
            alert("ログアウトしました");
            window.location.reload();
          }
        }>ログアウト</a>
      </li>
    );
  }

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
        {loginNav}
        {/* <li className={styles.right}>
          <a>設定</a>
        </li> */}
      </ul>
      <Modal isOpen={modalIsOpen} style={modalStyle} onRequestClose={() => setIsOpen(false)} className="modalContent" overlayClassName="modalOverlay" closeTimeoutMS={200} >
        <button style={{
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
  }} onClick={() => setIsOpen(false)}>×</button>
        <h2>ログイン</h2>
        <form method="POST">
          <h3>学籍番号</h3>
          <input type="text" name="username" /><br />
          <h3>パスワード</h3>
          <input type="password" name="password" />
          <br />
          <input type="submit" value="ログイン" onClick={handleLogin} />
        </form>

        <p>
          ログインは大産大の電研部員のみが可能となっております。
        </p>
      </Modal>
    </nav>
  );
};

export default Navbar;
