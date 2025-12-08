import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { useEffect, useState } from "react";
import Link from "next/link";

const PortalPage : NextPage = () => {
  const [activeTab, setActiveTab] = useState<"main" | "settings" | "blog">("main");

  const [userName, setUserName] = useState("Unknown");
  const [email, setEmail] = useState("")

  const [msg, setMsg] = useState("");

  async function updateUserData4api(key: string, value: string): Promise<boolean> {
    try {
      const res = await fetch("https://api.osudenken4dev.workers.dev/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("idToken")}`
        },
        body: JSON.stringify({ [key]: value })
      });

      const data = await res.json();

      if (data.displayName) {
        console.log(`${key} updated successfully.`);
        return true;
      } else {
        console.error(`Failed to update ${key}.`);
        console.log(data);
        return false;
      }
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("idToken");
    if (!token) window.location.href = "/?i=portal/#login";
  
    const name = localStorage.getItem("name");
    if (name) setUserName(name);



    const params = new URLSearchParams(window.location.search);

    const msg = params.get("msg");
    if (msg) setMsg(msg);

    // todo :tab
    const tab = params.get("tab")
    if (tab) {

    }
  }, []);


  return (
    <div className={styles.container}>
      <main className={styles.main}>
        
        {msg ? <div className={portalStyles.notice}>{msg}</div> : ``}

        <div className={portalStyles.tabContainer}>
          <button
            className={`${portalStyles.tabButton} ${activeTab === "main" ? portalStyles.active : ""}`}
            onClick={() => setActiveTab("main")}
          >
            ポータル
          </button>
          <button
            className={`${portalStyles.tabButton} ${activeTab === "settings" ? portalStyles.active : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            設定
          </button>
          <button
            className={`${portalStyles.tabButton} ${activeTab === "blog" ? portalStyles.active : ""}`}
            onClick={() => setActiveTab("blog")}
          >
            ブログ
          </button>
        </div>

        <div className={portalStyles.tabContent}>
          {activeTab === "main" && (
            <div className={portalStyles.tabPane}>
              <h1 id="title">ようこそ、{userName} さん</h1>
              <p className={styles.description}>
              </p>
            </div>
          )}
          {activeTab === "settings" && (
            <div className={portalStyles.tabPane}>
              <h2>ユーザー設定</h2>
              <h3>ユーザー名</h3>
              <p className={styles.description}>
                デフォルトでは学籍番号が設定されています。<br />変更する場合は以下の入力欄に新しいユーザー名を入力し、更新ボタンを押してください。
              </p>

              <div className={portalStyles.inputGroup}>
                <input type="text" id="usernameInput" placeholder="ユーザー名" value={userName} onChange={(e) => setUserName(e.target.value)} className={portalStyles.portal} />
                <button onClick={() => {
                  const input = document.getElementById("usernameInput") as HTMLInputElement;
                  const newName = input.value.trim() as string;
                  if (newName) {
                    localStorage.setItem("name", newName);

                    updateUserData4api("name", newName).then(ok => {
                      if (ok) {
                        setMsg("ユーザー名を更新しました。");
                      } else {
                        alert("ユーザー名の更新に失敗しました。");
                      }
                    });
                  } else {
                    alert("有効なユーザー名を入力してください。");
                  }
                }} className={portalStyles.portal}>更新</button>
              </div>

              <br />

              <h3>メールアドレス</h3>
              <p className={styles.description}>
                デフォルトでは大学から付与されたメールアドレスが設定されています。<br />変更する場合は以下の入力欄に新しいメールアドレスを入力し、更新ボタンを押してください。
              </p>

              <div className={portalStyles.inputGroup}>
                <input type="text" id="emailInput" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} className={portalStyles.portal} />
                <button onClick={() => {
                  const input = document.getElementById("emailInput") as HTMLInputElement;
                  const newEmail = input.value.trim() as string;
                  if (newEmail) {
                    updateUserData4api("email", newEmail).then(ok => {
                      if (ok) {
                        setMsg("メールアドレスを更新しました。");
                      } else {
                        alert("メールアドレスの更新に失敗しました。");
                      }
                    });
                  } else {
                    alert("有効なメールアドレスを入力してください。");
                  }
                }} className={portalStyles.portal}>更新</button>
              </div>

              <h3>パスワードの再設定</h3>
              <p className={styles.description}>
                パスワードを再設定するには<Link href="/resetpass/">こちら</Link>からメールアドレスを入力してください。
              </p>
            </div>
          )}
          {activeTab === "blog" && (
            <div className={portalStyles.tabPane}>
              <h2>ブログ</h2>
              <p className={styles.description}>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PortalPage;