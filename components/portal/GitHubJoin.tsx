import { useEffect, useState } from "react";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { apiFetch, apiJson } from "@lib/api";

/**
 * 部員が Organization への招待を受け取るフォーム。
 * GitHub連携済みならトークンからアカウント名を自動取得してワンクリック参加、
 * 未連携なら従来どおりアカウント名を手入力する。
 */
export const GitHubJoin = () => {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  // 連携済みのGitHubログイン名。null=未連携、undefined=確認中
  const [connected, setConnected] = useState<string | null | undefined>(undefined);
  // 連携済みでも手入力に切り替えたいとき用
  const [manual, setManual] = useState(false);

  useEffect(() => {
    apiJson<{ username: string | null }>("/github/username", { method: "GET" })
      .then(d => setConnected(d.username ?? null))
      .catch(() => setConnected(null));
  }, []);

  const invite = async (name?: string) => {
    setStatus("sending");
    setMessage("");

    try {
      const res = await apiFetch("/github/join", {
        method: "POST",
        body: JSON.stringify(name ? { username: name } : {}),
      });
      const data: any = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setMessage(data?.message || "招待に失敗しました。アカウント名を確認してください。");
        return;
      }

      setStatus("done");
      setMessage(`${data.username ? `@${data.username} ` : ""}宛に招待を送りました。GitHubの通知かメールから承認してください。`);
    } catch (e) {
      console.error("Failed to invite to org:", e);
      setStatus("error");
      setMessage("通信に失敗しました。時間をおいて再度お試しください。");
    }
  };

  const onManualInvite = () => {
    const name = username.trim();
    if (!name) {
      setStatus("error");
      setMessage("GitHubのアカウント名を入力してください。");
      return;
    }
    invite(name);
  };

  const useConnected = connected && !manual;

  return (
    <div className={portalStyles.editorSection}>
      <h2>GitHub Organizationに参加する</h2>

      {useConnected ? (
        <>
          <p className={styles.description}>
            連携中のGitHubアカウント <strong>@{connected}</strong> で電研のOrganizationに参加できます。
          </p>
          <div className={portalStyles.inputGroup}>
            <button type="button" className={portalStyles.portal}
              onClick={() => invite()} disabled={status === "sending"}>
              {status === "sending" ? "送信中…" : "このアカウントで参加"}
            </button>
          </div>
          <p className={portalStyles.hint} style={{ cursor: "pointer" }} onClick={() => setManual(true)}>
            別のアカウント名を使う
          </p>
        </>
      ) : (
        <>
          <p className={styles.description}>
            自分のGitHubアカウント名を入力すると、電研のOrganizationへの招待が届きます。
            {connected === null && "（設定タブでGitHub連携すると、次回から自動入力されます。）"}
          </p>
          <div className={portalStyles.inputGroup}>
            <input
              type="text"
              className={portalStyles.portal}
              placeholder="GitHubアカウント名"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") onManualInvite(); }}
              disabled={status === "sending"} />
            <button type="button" className={portalStyles.portal}
              onClick={onManualInvite} disabled={status === "sending"}>
              {status === "sending" ? "送信中…" : "招待を受け取る"}
            </button>
          </div>
        </>
      )}

      {message && (
        <p className={status === "error" ? styles.description : portalStyles.hint}>{message}</p>
      )}
    </div>
  );
};
