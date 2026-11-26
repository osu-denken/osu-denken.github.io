import type { NextPage } from "next";
import { useState, type FormEvent } from "react";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { apiJson } from "@lib/api";

const ResetpassPage : NextPage = () => {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) {
      alert("学籍番号またはメールアドレスを入力してください。");
      return;
    }

    setBusy(true);
    try {
      await apiJson("/user/resetPassword", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email: value })
      });
      setSent(true);
    } catch (error) {
      console.error("Error:", error);
      alert("メールを送信できませんでした。時間をおいて再度お試しください。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>パスワードの再設定</h1>
        {sent ? (
          <p className={styles.description}>
            登録済みのアカウントであれば、大学のメールアドレス宛に再設定用のメールを送信しました。<br />
            メール内のリンクから新しいパスワードを設定してください。
          </p>
        ) : (
          <>
            <p className={styles.description}>
              学籍番号またはメールアドレスを入力して送信してください。登録済みのメールアドレス宛に再設定用のメールを送信します。
            </p>

            <div className={portalStyles.inputGroup}>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  placeholder="学籍番号またはメールアドレス"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={portalStyles.portal}
                />
                <button type="submit" disabled={busy} className={portalStyles.portal}>送信</button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ResetpassPage;
