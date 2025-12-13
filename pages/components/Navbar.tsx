import Image from "next/image";
import styles from "@styles/Navbar.module.css";
import Modal from "react-modal";
import { useState, useEffect } from "react";
import Link from "next/link";

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
  const [isLogin, setIsLogin] = useState<boolean | null>(null);
  const [userName, setUserName] = useState("");

  // ログイン状態を取得する
  useEffect(() => {
    const token = localStorage.getItem("idToken");
    if (token) {
      setIsLogin(true);
      setUserName(localStorage.getItem("displayName") || "Unknown");
    } else {
      setIsLogin(false);
    }
  }, []);

  // #loginがある場合はログイン画面を開く
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === "#login") {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);

    return () => {
      window.removeEventListener("hashchange", checkHash);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('.App');
    }
  }, []);

  // ログイン処理
  const handleLogin = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    const form = e.currentTarget.form;
    if (!form) return;
    const formData = new FormData(form);
    const email = formData.get("username");
    const password = formData.get("password");

    fetch("https://api.osudenken4dev.workers.dev/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    })
      .then(response => response.json())
      .then(data => {
        // console.log("data:", data);

        if (!data.displayName) { // data.nameがない場合は メールアドレスemailの@より前、ユーザ名にする。
          if (typeof email === "string") {
            const atIndex = email.indexOf("@");
            data.displayName = atIndex !== -1 ? email.substring(0, atIndex) : email;
          } else {
            data.displayName = "Unknown";
          }
        }

        // XSS対策のためのサニタイズ
        data.displayName = data.displayName ? data.displayName.replace(/</g, "&lt;").replace(/>/g, "&gt;") : data.name;

        if (data.idToken) {
          localStorage.setItem("idToken", data.idToken);
          localStorage.setItem("displayName", data.displayName);
          
          const params = new URLSearchParams(window.location.search);
          const param_i = params.get("i");
          if (param_i) {
            window.location.href = "/" + param_i;
            return;
          }

          setIsOpen(false);

          history.replaceState(null, "", window.location.pathname + window.location.search); // #loginを外す
          window.location.reload();
        } else {
          console.log(data);
          if (data.error) {
            if (data.error.message === "INVALID_LOGIN_CREDENTIALS") {
              alert("学籍番号またはパスワードが間違っています。");
              return;
            }

            alert("ログイン失敗: " + data.error.message);
            return;
          }

          alert("ログイン失敗: " + data.message);
        }
      })
      .catch(error => {
        console.error("Error:", error);
        alert("ログイン中にエラーが発生しました。");
      });
  }

  // ナビバーにあるログイン状態でそれぞれ表示する項目
  let rightNavItem = null;

  // ログイン時
  if (isLogin) {
    rightNavItem = (
      <>
        <li className={styles.right}>
          <Link href="/portal/">{userName}</Link>
        </li>
        <li>
          <a href="#logout" onClick={() => {
            localStorage.removeItem("idToken");
            localStorage.removeItem("displayName");
            window.location.reload();
          }}>
            ログアウト
          </a>
        </li>
      </>
    );
  } else {
    rightNavItem = (
      <>
        <li className={styles.right}>
          <a href="https://osu-denken.github.io/blog/join">入部</a>
        </li>
        <li>
          <a href="#login">ログイン</a>
        </li>
      </>
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
        {rightNavItem}
        {/* <li className={styles.right}>
          <a>設定</a>
        </li> */}
      </ul>
      <Modal isOpen={modalIsOpen} style={modalStyle} onRequestClose={() => { history.replaceState(null, "", window.location.pathname + window.location.search); setIsOpen(false); }} className="modalContent" overlayClassName="modalOverlay" closeTimeoutMS={200} >
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
  }} onClick={() => { history.replaceState(null, "", window.location.pathname + window.location.search); setIsOpen(false); }}>×</button>
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
