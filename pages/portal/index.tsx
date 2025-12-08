import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { useEffect, useState } from "react";
import Link from "next/link";

const PortalPage : NextPage = () => {
  const [activeTab, setActiveTab] = useState<"main" | "settings" | "blog">("main");
  const [msg, setMsg] = useState("");

  const [userName, setUserName] = useState("Unknown");
  const [email, setEmail] = useState("");
  const [blogList, setBlogList] = useState([]);
  const [loadedBlogList, setLoadedBlogList] = useState(false);
  const [discordInviteUrl, setDiscordInviteUrl] = useState("");
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { // ブログタブを初回開いたときに動作する
    if (activeTab === "blog" && !loadedBlogList) {
      fetch("https://api.osudenken4dev.workers.dev/blog/list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      })
        .then(res => res.json())
        .then(data => {          
          setBlogList(data ?? []);
          setLoadedBlogList(true); // 2回目以降はロードしないようにする
        })
        .catch(e => {
          console.error("Failed to load blog list:", e);
        });
  }
}, [activeTab]);

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

      if (data.success) {
        console.log(`${key} updated successfully.`);
        return true;
      } else {
        console.error(`Failed to update ${key}.`);
        console.log(data);
        return false;
      }
    } catch (e) {
      console.error("Error:", e);
      return false;
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("idToken");
    if (!token) window.location.href = "/?i=portal/#login";
  
    const name = localStorage.getItem("displayName");
    if (name) setUserName(name);



    const params = new URLSearchParams(window.location.search);

    const msg = params.get("msg");
    if (msg) setMsg(msg);

    const tab: any = params.get("tab")
    if (tab) setActiveTab(tab);


    fetch("https://api.osudenken4dev.workers.dev/discord/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("idToken")}`
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setDiscordInviteUrl(data.code);
      })
      .catch(e => {
        console.error("Failed to discord invite url:", e);
      });
  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        
        {msg ? <div className={portalStyles.notice}>{msg}</div> : ``}

        <div className={portalStyles.tabContainer}>
          <button
            className={`${portalStyles.tabButton} ${activeTab === "main" ? portalStyles.active : ""}`}
            onClick={() => setActiveTab("main")} >
            ポータル
          </button>
          <button
            className={`${portalStyles.tabButton} ${activeTab === "settings" ? portalStyles.active : ""}`}
            onClick={() => setActiveTab("settings")} >
            設定
          </button>
          <button
            className={`${portalStyles.tabButton} ${activeTab === "blog" ? portalStyles.active : ""}`}
            onClick={() => setActiveTab("blog")} >
            ブログ
          </button>
        </div>

        <div className={portalStyles.tabContent}>
          {activeTab === "main" && (
            <div className={portalStyles.tabPane}>
              <h1 id="title">ようこそ、{userName} さん</h1>
              <p className={styles.description}>
                <Link href={discordInviteUrl}>Discordへ参加する</Link>
              </p>
            </div>
          )}
          {activeTab === "settings" && (
            <div className={portalStyles.tabPane}>
              <h1>ユーザー設定</h1>
              <h2>ユーザー名</h2>
              <p className={styles.description}>
                デフォルトでは学籍番号が設定されています。<br />変更する場合は以下の入力欄に新しいユーザー名を入力し、更新ボタンを押してください。
              </p>
              <form>
                <div className={portalStyles.inputGroup}>
                  <input type="text" id="usernameInput" placeholder="ユーザー名" value={userName} onChange={(e) => setUserName(e.target.value)} className={portalStyles.portal} />
                  <button onClick={(e) => {
                    e.preventDefault();
                    const input = document.getElementById("usernameInput") as HTMLInputElement;
                    const newName = input.value.trim() as string;
                    if (newName) {
                      updateUserData4api("displayName", newName).then(ok => {
                        if (ok) {
                          setMsg("ユーザー名を更新しました。");
                          localStorage.setItem("displayName", newName);
                        } else {
                          console.log(ok);
                          alert("ユーザー名の更新に失敗しました。");
                        }
                      });
                    } else {
                      alert("有効なユーザー名を入力してください。");
                    }
                  }} className={portalStyles.portal}>更新</button>
                </div>
              </form>

              <br />

              <h2>メールアドレス</h2>
              <p className={styles.description}>
                デフォルトでは大学から付与されたメールアドレスが設定されています。<br />変更する場合は以下の入力欄に新しいメールアドレスを入力し、更新ボタンを押してください。
              </p>

              <form>
                <div className={portalStyles.inputGroup}>
                  <input type="text" id="emailInput" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} className={portalStyles.portal} />
                  <button onClick={(e) => {
                    e.preventDefault();
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
              </form>

              <br />

              <h2>パスワードの再設定</h2>
              <p className={styles.description}>
                パスワードを再設定するには<Link href="/resetpass/">こちら</Link>からメールアドレスを入力してください。
              </p>
            </div>
          )}
          {activeTab === "blog" && (
            <div className={portalStyles.tabPane}>
              <h1>ブログ</h1>
              <p className={styles.description}>
              </p>

              <div className={portalStyles.grid}>
                {blogList.map((page: any) => (
                  <Link href={"/blog/editor/?page=" + page.name}>
                    <div key={page.sha} className={portalStyles.card}>
                      <h3>{page.name}</h3>
                      <p>{page.summary}</p>
                    </div>
                  </Link>
                ))}
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PortalPage;
