import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { apiJson, storeTokens } from "@lib/api";
import GoogleLoginButton from "@components/GoogleLoginButton";
import { GitHubOrgsJoin } from "@components/portal/GitHubOrgsJoin";

interface IntegrationsTabProps {
  setMsg: (msg: string) => void;
  hasGitHubToken: boolean;
}

/**
 * 外部サービスとの連携をまとめたタブ。
 * Google連携 / GitHub連携 / GitHub Organizationへの参加。
 */
export const IntegrationsTab = ({ setMsg, hasGitHubToken }: IntegrationsTabProps) => {
  // 連携状態。ボタンの出し分けと、解除時の締め出し防止に使う
  const [providers, setProviders] = useState<{ hasPassword: boolean; hasGoogle: boolean } | null>(null);

  const loadProviders = () => {
    apiJson<{ hasPassword?: boolean; hasGoogle?: boolean }>("/user/providers", { method: "POST" })
      .then(d => setProviders({ hasPassword: Boolean(d.hasPassword), hasGoogle: Boolean(d.hasGoogle) }))
      .catch(e => console.error("Failed to load providers.", e));
  };

  useEffect(loadProviders, []);

  const onLinkGoogle = async (credential: string) => {
    try {
      const data: any = await apiJson("/user/linkGoogle", { method: "POST", body: JSON.stringify({ credential }) });
      if (!data.success) {
        alert("Google連携に失敗しました。" + (data.message ?? ""));
        return;
      }

      // 連携でトークンが再発行されるので、現在のセッションを更新しておく
      if (data.idToken && data.refreshToken) storeTokens(data.idToken, data.refreshToken);
      setMsg("Googleアカウントを連携しました。次回からソーシャルログインも使えます。");
      loadProviders();
    } catch (e) {
      console.error("Failed to link Google.", e);
      alert("Google 連携に失敗しました。");
    }
  };

  const onUnlinkGoogle = async () => {
    // パスワード未設定で外すとログイン手段が無くなる。サーバも弾くが、UI でも先に止める
    if (providers && !providers.hasPassword) {
      alert("パスワードが未設定のため解除できません。解除するとログインできなくなります。先にパスワードを設定してください。");
      return;
    }
    if (!confirm("Google連携を解除しますか？")) return;

    try {
      const data: any = await apiJson("/user/unlinkGoogle", { method: "POST" });
      if (!data.success) {
        alert(data.message === "NO_OTHER_METHOD"
          ? "パスワードが未設定のため解除できません。先にパスワードを設定してください。"
          : "Google 連携の解除に失敗しました。");
        return;
      }

      setMsg("Google 連携を解除しました。");
      loadProviders();
    } catch (e) {
      console.error("Failed to unlink Google.", e);
      alert("Google 連携の解除に失敗しました。");
    }
  };

  const onConnectGitHub = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const data: any = await apiJson("/github/oauth/start", { method: "POST" });
      if (!data.success || !data.url) {
        alert(data.message === "NOT_CONFIGURED"
          ? "GitHub連携は現在利用できません（未設定）。"
          : "GitHub連携の開始に失敗しました。");
        return;
      }
      // GitHub の認可画面へ遷移。完了後はコールバックが連携タブへ戻す
      window.location.href = data.url;
    } catch (err) {
      console.error("Failed to start GitHub OAuth.", err);
      alert("GitHub連携の開始に失敗しました。");
    }
  };

  const onChangeGitHubToken = async (e: React.MouseEvent) => {
    e.preventDefault();
    const input = document.getElementById("ghtokenInput") as HTMLInputElement;
    const newToken = input.value.trim();
    if (!newToken) {
      alert("有効なGitHub PATを入力してください。");
      return;
    }

    try {
      const data: any = await apiJson("/github/token", { method: "POST", body: JSON.stringify({ githubToken: newToken }) });
      if (!data.success) throw new Error("failed");
      setMsg("GitHub PATを更新しました。");
    } catch {
      alert("GitHub PATの更新に失敗しました。");
    }
  };

  const onDeleteGitHubToken = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const data: any = await apiJson("/github/token", { method: "DELETE" });
      if (!data.success) throw new Error("failed");
      setMsg("GitHub連携を解除しました。");
    } catch {
      alert("GitHub連携の解除に失敗しました。");
    }
  };

  return (
    <div className={portalStyles.tabPane}>
      <h1>連携</h1>

      <h2>Googleアカウント</h2>
      {providers?.hasGoogle ? (
        <>
          <p className={styles.description}>Googleアカウントと連携済みです。</p>
          <div className={portalStyles.inputGroup}>
            <button onClick={onUnlinkGoogle} className={portalStyles.portal}
              disabled={!providers.hasPassword} style={{ backgroundColor: "#a66666" }}>
              連携を解除
            </button>
          </div>
          {!providers.hasPassword && (
            <p className={styles.description}>
              解除するとログイン手段が無くなるため、先にパスワードを設定してください。
            </p>
          )}
        </>
      ) : (
        <>
          <p className={styles.description}>
            大学のGoogleアカウントを連携すると、次回からソーシャルログインも利用できます。
          </p>
          <div className={portalStyles.inputGroup}>
            <GoogleLoginButton onCredential={onLinkGoogle} />
          </div>
        </>
      )}

      <h2 style={{ marginTop: "2rem" }}>GitHub</h2>
      <p className={styles.description}>
        {hasGitHubToken
          ? "GitHubと連携済みです。自身のGitHubアカウントとしてOSU-Denken-Web API経由でコミットできます。"
          : "「GitHubで接続」を押して認可すると、自身のGitHubアカウントとしてOSU-Denken-Web API経由でコミットできます。"}
      </p>
      <div className={portalStyles.inputGroup}>
        <button onClick={onConnectGitHub} className={portalStyles.portal}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4em" }}>
          <Icon icon="fa6-brands:github" />
          {hasGitHubToken ? "GitHubで再接続" : "GitHubで接続"}
        </button>

        {hasGitHubToken &&
          <button onClick={onDeleteGitHubToken} className={portalStyles.portal}>連携を解除</button>
        }
      </div>

      <details style={{ marginTop: "0.8em" }}>
        <summary className={styles.description} style={{ cursor: "pointer" }}>
          PAT（個人アクセストークン）を手動で設定する
        </summary>
        <p className={styles.description}>
          デフォルトではosu-denken-adminのトークンを利用します。接続の代わりにPATを直接貼り付けることもできます。
        </p>
        <div className={portalStyles.inputGroup}>
          <input type="text" id="ghtokenInput" placeholder="GitHub PAT" className={portalStyles.portal} />
          <button onClick={onChangeGitHubToken} className={portalStyles.portal}>変更</button>
          {hasGitHubToken &&
            <button onClick={onDeleteGitHubToken} className={portalStyles.portal}>削除</button>
          }
        </div>
      </details>

      <h2 style={{ marginTop: "2rem" }}>GitHub Organization</h2>
      <GitHubOrgsJoin />
    </div>
  );
};
