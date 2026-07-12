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
import { PrivatePostTab } from "@components/portal/PrivatePostTab";
import { PageTab } from "@components/portal/PageTab";
import { LogTab } from "@components/portal/LogTab";
import { GitHubJoin } from "@components/portal/GitHubJoin";

type TabName = "main" | "settings" | "blog" | "private" | "page" | "image" | "logs";

const TABS: { id: TabName; label: string }[] = [
  { id: "main", label: "ポータル" },
  { id: "settings", label: "設定" },
  { id: "blog", label: "ブログ" },
  { id: "private", label: "非公開記事" },
  { id: "page", label: "ページ" },
  { id: "image", label: "画像" },
  { id: "logs", label: "ログ" },
];

/** タブを開くのに要る権限。ここに無いタブは誰でも開ける */
const TAB_PERMISSIONS: Partial<Record<TabName, number>> = {
  blog: Permission.BlogEdit,
  private: Permission.PrivatePostView,
  page: Permission.PageEdit,
  logs: Permission.LogView,
};

const PortalPage : NextPage = () => {
  const [activeTab, setActiveTab] = useState<TabName>("main");
  const [msg, setMsg] = useState("");

  const [portalData, setPortalData] = useState<any>(null);

  const [userName, setUserName] = useState("Unknown");
  const [discordInviteUrl, setDiscordInviteUrl] = useState("");

  const [activeTabInitialized, setActiveTabInitialized] = useState(false);

  const permissions: number = portalData?.permissions ?? 0;

  // 権限の解決前はタブを出さない。開けないタブを一瞬見せないため
  const canOpen = (tab: TabName) => {
    const required = TAB_PERMISSIONS[tab];
    return required === undefined || hasPermission(permissions, required);
  };

  const visibleTabs = TABS.filter(tab => canOpen(tab.id));

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
          {visibleTabs.map(tab => (
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
                {hasPermission(permissions, Permission.DiscordInviteView) && (
                  <Link href={discordInviteUrl}>Discordへ参加する</Link>
                )}

                {hasPermission(permissions, Permission.InviteCodeCreate) && (
                  <>
                    <br />
                    <Link href="/portal/invite/">招待コードの作成</Link>
                  </>
                )}

                {hasPermission(permissions, Permission.MemberManage) && (
                  <>
                    <br />
                    <Link href="/portal/members/">構成員名簿</Link>
                  </>
                )}

                {hasPermission(permissions, Permission.MemberManage) && (
                  <>
                    <br />
                    <Link href="/portal/admin/members/">部員管理</Link>
                  </>
                )}

                {hasPermission(permissions, Permission.MemberManage) && (
                  <>
                    <br />
                    <Link href="https://totp.kmmz.jp/?email=osudenken4dev@gmail.com" target="_blank" rel="noopener noreferrer">
                      ワンタイムパスワード管理
                    </Link>
                  </>
                )}
              </p>

              <GitHubJoin />
            </div>
          )}
          {activeTab === "settings" && (
            <SettingsTab userName={userName} setUserName={setUserName} setMsg={setMsg}
              hasGitHubToken={Boolean(portalData?.hasGitHubToken)} hasTotp={Boolean(portalData?.hasTotp)}
              recoveryCodesLeft={portalData?.recoveryCodesLeft ?? 0} />
          )}
          {activeTab === "blog" && canOpen("blog") && <BlogTab setMsg={setMsg} />}
          {activeTab === "private" && canOpen("private") && <PrivatePostTab permissions={permissions} setMsg={setMsg} />}
          {activeTab === "page" && canOpen("page") && <PageTab />}
          {activeTab === "image" && <ImageTab permissions={permissions} setMsg={setMsg} />}
          {activeTab === "logs" && canOpen("logs") && <LogTab setMsg={setMsg} />}
        </div>
      </main>
    </div>
  );
};

export default PortalPage;
