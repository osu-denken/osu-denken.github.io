import { useState } from "react";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { apiFetch } from "@lib/api";

/**
 * 部員が自分の GitHub アカウント名を入力して Organization への招待を受け取るフォーム。
 * 認証済みの部員なら誰でも使える。
 */
export const GitHubJoin = () => {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const onInvite = async () => {
    const name = username.trim();
    if (!name) {
      setStatus("error");
      setMessage("GitHubのアカウント名を入力してください。");
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const res = await apiFetch("/github/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name }),
      });
      const data: any = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setMessage(data?.message || "招待に失敗しました。アカウント名を確認してください。");
        return;
      }

      setStatus("done");
      setMessage(`招待を送りました。GitHubの通知かメールから承認してください。`);
    } catch (e) {
      console.error("Failed to invite to org:", e);
      setStatus("error");
      setMessage("通信に失敗しました。時間をおいて再度お試しください。");
    }
  };

  return (
    <div className={portalStyles.editorSection}>
      <h2>GitHub Organizationに参加する</h2>
      <p className={styles.description}>
        自分のGitHubアカウント名を入力すると、電研のOrganizationへの招待が届きます。
      </p>

      <div className={portalStyles.inputGroup}>
        <input
          type="text"
          className={portalStyles.portal}
          placeholder="GitHubアカウント名 (例: octocat)"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") onInvite(); }}
          disabled={status === "sending"} />
        <button
          type="button"
          className={portalStyles.portal}
          onClick={onInvite}
          disabled={status === "sending"}>
          {status === "sending" ? "送信中…" : "招待を受け取る"}
        </button>
      </div>

      {message && (
        <p className={status === "error" ? styles.description : portalStyles.hint}>{message}</p>
      )}
    </div>
  );
};
