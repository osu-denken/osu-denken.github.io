import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { useEffect, useState } from "react";
import Link from "next/link";

const PortalPage : NextPage = () => {
  const [activeTab, setActiveTab] = useState<"main" | "settings" | "blog">("main");
  const [msg, setMsg] = useState("");
  
  const [portalData, setPortalData] = useState<any>(null);
  const [_localStorage, _setLocalStorage] = useState<any>(null);

  const [userName, setUserName] = useState("Unknown");
  // const [email, setEmail] = useState("");
  const [blogList, setBlogList] = useState([]);
  const [loadedBlogList, setLoadedBlogList] = useState(false);
  const [discordInviteUrl, setDiscordInviteUrl] = useState("");
  
  const [activeTabInitialized, setActiveTabInitialized] = useState(false);
  
  useEffect(() => {
    if (!activeTabInitialized) return;
    const params = new URLSearchParams(window.location.search);
    params.set("tab", activeTab);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [activeTab]);


  useEffect(() => {
    _setLocalStorage(localStorage);

    fetch("https://api.osudenken4dev.workers.dev/portal", {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("idToken")}`
      }
    }).then(res => res.json()).then((data: any) => {
      console.log(data)
      if (data.user && data.user.error) {
        if (data.user.error.message === "INVALID_ID_TOKEN") {
          alert("セッションの有効期限が切れました。再度ログインしてください。");
          window.location.href = "/?i=portal/#login";
        }
      }

      if (!data.success) {
        if (data.status === 401) {
          alert("セッションの有効期限が切れました。再度ログインしてください。");
          window.location.href = "/?i=portal/#login";
        }
      }
      setPortalData(data);
      // setEmail(data.user.email || "");

      if (data.limits) {
        setDiscordInviteUrl(data.limits.discordInviteCode)
      }

    });
  }, []);

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

    setActiveTabInitialized(true);

    // fetch("https://api.osudenken4dev.workers.dev/discord/invite", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${localStorage.getItem("idToken")}`
    //   },
    // })
    //   .then(res => res.json())
    //   .then(data => {
    //     if (data.success) setDiscordInviteUrl(data.code);
    //   })
    //   .catch(e => {
    //     console.error("Failed to discord invite url:", e);
    //   });
  }, []);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { // ブログタブを初回開いたときに動作する
    if (activeTab === "blog" && !loadedBlogList) {
      fetch("https://api.osudenken4dev.workers.dev/v2/blog/list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      })
        .then(res => res.json())
        .then((data: any) => {          
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

      const data: any = await res.json();

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

  async function updateGitHubToken(value: string): Promise<boolean> {
    try {
      const res = await fetch("https://api.osudenken4dev.workers.dev/github/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("idToken")}`
        },
        body: JSON.stringify({ githubToken: value })
      });

      const data: any = await res.json();

      if (data.success) {
        console.log(`GitHub Token updated successfully.`);
        return true;
      } else {
        console.error(`Failed to update GitHub Token.`);
        console.log(data);
        return false;
      }
    } catch (e) {
      console.error("Error:", e);
      return false;
    }
  }

  async function deleteGitHubToken(): Promise<boolean> {
    try {
      const res = await fetch("https://api.osudenken4dev.workers.dev/github/token", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("idToken")}`
        }
      });

      const data: any = await res.json();

      if (data.success) {
        console.log(`GitHub Token deleted successfully.`);
        return true;
      } else {
        console.error(`Failed to delete GitHub Token.`);
        console.log(data);
        return false;
      }
    } catch (e) {
      console.error("Error:", e);
      return false;
    }
  }

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
                <br />

                <Link href="/portal/invite/">招待コードの作成</Link>
                <br />

                <Link href="/portal/members/">構成員名簿</Link>
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
                  }} className={portalStyles.portal}>変更</button>
                </div>
              </form>

              <br />

              {/* <h2>メールアドレス</h2>
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

              <br /> */}

              <h2>パスワードの再設定</h2>
              <p className={styles.description}>
                パスワードを再設定するには<Link href="/resetpass/">こちら</Link>からメールアドレスを入力してください。
              </p>

              <h2>GitHub PAT</h2>
              <p className={styles.description}>
                デフォルトではosu-denken-adminのトークンを利用しますが、こちらを設定することで自身のGitHubアカウントとしてOSU-Denken-Web API経由でコミットすることが可能です。
              </p>
              <form>
                <div className={portalStyles.inputGroup}>
                  <input type="text" id="ghtokenInput" placeholder="GitHub PAT" className={portalStyles.portal} />
                  <button onClick={(e) => {
                    e.preventDefault();
                    const input = document.getElementById("ghtokenInput") as HTMLInputElement;
                    const newToken = input.value.trim() as string;
                    if (newToken) {
                      updateGitHubToken(newToken).then(ok => {
                        if (ok) {
                          setMsg("GitHub PATを更新しました。");
                          return;
                        }
                        console.log(ok);
                        alert("GitHub PATの更新に失敗しました。");
                      });
                    } else {
                      alert("有効なGitHub PATを入力してください。");
                    }
                  }} className={portalStyles.portal}>変更</button>
                  
                  {portalData?.hasGitHubToken &&
                    <button onClick={(e) => {
                      e.preventDefault();
                      deleteGitHubToken().then(ok => {
                        if (ok) {
                          setMsg("GitHub PATを削除しました。");
                          return;
                        }
                        console.log(ok);
                        alert("GitHub PATの削除に失敗しました。");
                      });
                    }} className={portalStyles.portal}>削除</button>
                  }
                </div>
              </form>
              
            </div>
          )}
          {activeTab === "blog" && (
            <div className={portalStyles.tabPane}>
              <h1>ブログ</h1>
              <p className={styles.description}>
              </p>

              <form>
                <div className={portalStyles.inputGroup}>
                  <input type="text" name="page" placeholder="ファイル名" className={portalStyles.portal} defaultValue={
                    new Date().toISOString().split('T')[0] + "-" + (new Date().getHours() + new Date().getMinutes() + new Date().getSeconds())
                  } required />
                  <button type="button" className={portalStyles.portal} onClick={() => {
                    const pageInput = document.querySelector('input[name="page"]') as HTMLInputElement;
                    const page = pageInput.value.trim();
                    if (!page) {
                      setMsg("ファイル名を入力してください。");
                      return;
                    }
                    const encoded = encodeURIComponent(page);
                    window.location.href = `/portal/blog/?action=edit&page=${encoded}`;
                  }}>
                    新規作成
                  </button>
                </div>
              </form>

              <div className={portalStyles.grid}>
                {blogList.map((page: any) => (
                  <Link key={page.sha} href={"/portal/blog/?action=edit&page=" + page.name}>
                    <div className={portalStyles.card}>
                      <h3>{page.meta.title ? page.meta.title.slice(1, -1) : page.name}</h3>
                      <p>{page.meta ? new Date(page.meta.date).toLocaleDateString() : "-"}</p>
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
