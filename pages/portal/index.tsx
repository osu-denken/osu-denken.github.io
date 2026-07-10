import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, readIdToken, redirectToLogin } from "@lib/api";
import { hasPermission, Permission } from "@lib/member";
import { SettingsTab } from "@components/portal/SettingsTab";
import { BlogTab } from "@components/portal/BlogTab";
import { ImageTab } from "@components/portal/ImageTab";

type TabName = "main" | "settings" | "blog" | "image";

const TABS: { id: TabName; label: string }[] = [
  { id: "main", label: "ポータル" },
  { id: "settings", label: "設定" },
  { id: "blog", label: "ブログ" },
  { id: "image", label: "画像" },
];

const PortalPage : NextPage = () => {
  const [activeTab, setActiveTab] = useState<TabName>("main");
  const [msg, setMsg] = useState("");

  const [portalData, setPortalData] = useState<any>(null);

  const [userName, setUserName] = useState("Unknown");
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
    // apiFetch が 401 で idToken を取り直すので、数日ぶりの再訪でも再ログインは不要
    apiFetch("/portal", { method: "POST" })
      .then(async res => {
        if (res.status === 401) {
          redirectToLogin("portal/");
          return;
        }

        const data: any = await res.json();
        setPortalData(data);
        if (data.limits) setDiscordInviteUrl(data.limits.discordInviteCode);
      })
      .catch(e => console.error("Failed to load portal:", e));
  }, []);

  useEffect(() => {
    if (!readIdToken()) window.location.href = "/?i=portal/#login";

    const name = localStorage.getItem("displayName");
    if (name) setUserName(name);

    const params = new URLSearchParams(window.location.search);

    const msg = params.get("msg");
    if (msg) setMsg(msg);

    const tab = params.get("tab") as TabName | null;
    if (tab) setActiveTab(tab);

    setActiveTabInitialized(true);
  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.main}>

        {msg ? <div className={portalStyles.notice}>{msg}</div> : ``}

        <div className={portalStyles.tabContainer}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${portalStyles.tabButton} ${activeTab === tab.id ? portalStyles.active : ""}`}
              onClick={() => setActiveTab(tab.id)} >
              {tab.label}
            </button>
          ))}
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

                {hasPermission(portalData?.permissions ?? 0, Permission.MemberManage) && (
                  <>
                    <br />
                    <Link href="/portal/admin/members/">部員管理</Link>
                  </>
                )}
              </p>
            </div>
          )}
          {activeTab === "settings" && (
            <SettingsTab
              userName={userName}
              setUserName={setUserName}
              setMsg={setMsg}
              hasGitHubToken={Boolean(portalData?.hasGitHubToken)} />
          )}
          {activeTab === "blog" && <BlogTab setMsg={setMsg} />}
          {activeTab === "image" && <ImageTab setMsg={setMsg} />}
        </div>
      </main>
    </div>
  );
};

export default PortalPage;
