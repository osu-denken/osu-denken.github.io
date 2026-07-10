import type { NextPage } from "next";
import { useEffect, useState } from "react";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { API_BASE, apiJson, readIdToken, storeTokens } from "@lib/api";
import { Turnstile } from "@components/Turnstile";

/**
 * 仮登録の進み具合。
 * account: 未ログイン / verify: 要メール確認 / form: 入部情報の入力 / done: 申請済み
 */
type Step = "loading" | "account" | "verify" | "form" | "done";

interface UserInfo {
  email?: string;
  emailVerified?: boolean;
}

const JoinPage: NextPage = () => {
  const [step, setStep] = useState<Step>("loading");
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState("");

  // 入部情報
  const [name, setName] = useState("");
  const [furigana, setFurigana] = useState("");
  const [birthday, setBirthday] = useState("");
  const [phone, setPhone] = useState("");

  // 一次フォーム (大学アカウント限定) が渡すクエリで初期値を埋める。
  // ただしパラメータは改ざんできるので、本人性は後段のメール確認で担保する
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // 学籍番号だけで来ることもあるので、メールが無ければ学籍番号から補う
    setEmail(params.get("email") || params.get("number") || "");
    setName(params.get("name") || "");
    setFurigana(params.get("furigana") || "");
    setBirthday(params.get("birthday") || "");
    setPhone(params.get("phone") || "");
  }, []);

  // ログイン済みなら確認状態を見て次のステップを決める
  useEffect(() => {
    if (!readIdToken()) {
      setStep("account");
      return;
    }

    apiJson<UserInfo>("/user/info", { method: "POST" })
      .then(info => {
        if (info.email) setEmail(info.email);
        setStep(info.emailVerified ? "form" : "verify");
      })
      .catch(() => setStep("account"));
  }, []);

  // アカウントを作成し、確認メールを送ってもらう
  const onCreateAccount = async (accountEmail: string, password: string, turnstileToken: string) => {
    setMsg("");

    const res = await fetch(`${API_BASE}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: accountEmail, password, turnstileToken }),
    });
    const data: any = await res.json();

    if (!data.idToken) {
      setMsg(data.message === "EMAIL_EXISTS"
        ? "このメールアドレスは登録済みです。ログインしてから続けてください。"
        : `登録に失敗しました。${data.message ?? ""}`);
      return;
    }

    storeTokens(data.idToken, data.refreshToken);
    setEmail(accountEmail);
    setStep("verify");
  };

  const onResendVerify = async () => {
    setMsg("");
    await apiJson("/user/verifyEmail", { method: "POST" }).catch(() => {});
    setMsg("確認メールを再送しました。");
  };

  // メールのリンクを開いたあと、確認済みか調べて先へ進む
  const onCheckVerified = async () => {
    setMsg("");
    const info = await apiJson<UserInfo>("/user/info", { method: "POST" }).catch(() => null);

    if (info?.emailVerified) {
      setStep("form");
      return;
    }
    setMsg("まだ確認できていません。メール内のリンクを開いてから、もう一度お試しください。");
  };

  const onSubmitForm = async () => {
    setMsg("");
    if (!name.trim()) {
      setMsg("氏名を入力してください。");
      return;
    }

    const data = await apiJson<{ success?: boolean; message?: string }>("/members/register", {
      method: "POST",
      body: JSON.stringify({ name, furigana, birthday, tel: phone }),
    }).catch(() => null);

    if (!data?.success) {
      setMsg(`申請に失敗しました。${data?.message ?? ""}`);
      return;
    }

    setStep("done");
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>入部申請</h1>

        {msg ? <div className={portalStyles.notice}>{msg}</div> : ``}

        {step === "loading" && <p className={styles.description}>読み込み中...</p>}

        {step === "account" && (
          <AccountStep email={email} onEmailChange={setEmail} onSubmit={onCreateAccount} />
        )}

        {step === "verify" && (
          <div>
            <p className={styles.description}>
              {email} に確認メールを送りました。<br />
              メール内のリンクを開いてから、下のボタンを押してください。
            </p>
            <div className={portalStyles.inputGroup}>
              <button type="button" className={portalStyles.portal} onClick={onCheckVerified}>
                確認できたので次へ
              </button>
              <button type="button" className={portalStyles.portal} onClick={onResendVerify}>
                確認メールを再送
              </button>
            </div>
          </div>
        )}

        {step === "form" && (
          <div>
            <p className={styles.description}>
              以下の入力は入部届の発行、構成員名簿、部員管理システムに用います。<br />
              電話番号は任意です。あとから、または承認後に幹部が入力することもできます。
            </p>

            <div className={portalStyles.memberEditor}>
              <div className={portalStyles.field}>
                <label>氏名</label>
                <input type="text" className={portalStyles.portal} placeholder="電研 太郎"
                  value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className={portalStyles.field}>
                <label>フリガナ</label>
                <input type="text" className={portalStyles.portal} placeholder="でんけん たろう"
                  value={furigana} onChange={e => setFurigana(e.target.value)} />
              </div>
              <div className={portalStyles.field}>
                <label>生年月日</label>
                <input type="date" className={portalStyles.portal}
                  value={birthday} onChange={e => setBirthday(e.target.value)} />
              </div>
              <div className={portalStyles.field}>
                <label>連絡先（携帯・任意）</label>
                <input type="tel" className={portalStyles.portal} placeholder="090-1234-5678"
                  value={phone} onChange={e => setPhone(e.target.value)} />
              </div>

              <div className={portalStyles.editorActions}>
                <button type="button" className={portalStyles.portal} onClick={onSubmitForm}>申請する</button>
              </div>
            </div>
          </div>
        )}

        {step === "done" && (
          <p className={styles.description}>
            仮登録を申請しました。部員の承認をお待ちください。<br />
            承認されると、ポータルの各機能が使えるようになります。
          </p>
        )}
      </main>
    </div>
  );
};

interface AccountStepProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: (email: string, password: string, turnstileToken: string) => void;
}

// 大学メールでアカウントを作る。メールアドレスは一次フォームから引き継ぐことがある
const AccountStep = ({ email, onEmailChange, onSubmit }: AccountStepProps) => {
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  return (
    <div>
      <p className={styles.description}>
        まず、大学から配布されたメールアドレスでアカウントを作成します。<br />
        すでにアカウントをお持ちの方は{" "}
        {/* トップの #login を開くためのリンク。ページ内アンカーなので Link ではなく a を使う */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/?i=join/#login">ログイン</a> してください。
      </p>

      <div className={portalStyles.memberEditor}>
        <div className={portalStyles.field}>
          <label>メールアドレス（学籍番号）</label>
          <input type="text" className={portalStyles.portal} placeholder="s20a000@ge.osaka-sandai.ac.jp"
            value={email} onChange={e => onEmailChange(e.target.value)} />
        </div>
        <div className={portalStyles.field}>
          <label>パスワード</label>
          <input type="password" className={portalStyles.portal}
            value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        <Turnstile onToken={setTurnstileToken} />

        <div className={portalStyles.editorActions}>
          <button type="button" className={portalStyles.portal} onClick={() => onSubmit(email, password, turnstileToken)}>
            アカウントを作成
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinPage;
