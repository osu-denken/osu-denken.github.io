import type { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { API_BASE, apiJson, readIdToken, storeTokens } from "@lib/api";
import { MemberStatus } from "@lib/member";
import GoogleLoginButton from "@components/GoogleLoginButton";

/**
 * 仮登録の進み具合。
 * account: 未ログイン / verify: 要メール確認 / form: 入部情報の入力 /
 * done: 申請済み / member: 既に名簿に載っている
 */
type Step = "loading" | "account" | "verify" | "form" | "done" | "member";

interface UserInfo {
  email?: string;
  emailVerified?: boolean;
}

const JoinPage: NextPage = () => {
  const [step, setStep] = useState<Step>("loading");
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState("");
  // 確認メールを実際に送ったか。着地しただけでは送っていないので、
  // 「送りました」と偽らないためにフラグで管理する
  const [mailSent, setMailSent] = useState(false);

  // 入部情報
  const [name, setName] = useState("");
  const [furigana, setFurigana] = useState("");
  const [birthday, setBirthday] = useState("");
  const [phone, setPhone] = useState("");
  const [hobby, setHobby] = useState("");
  const [wish, setWish] = useState("");
  const [note, setNote] = useState("");

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

  // ログイン済みなら確認状態を見て次のステップを決める。ログイン直後にも呼ぶ
  const advanceAfterLogin = async () => {
    const info = await apiJson<UserInfo>("/user/info", { method: "POST" }).catch(() => null);
    if (!info) {
      setStep("account");
      return;
    }

    if (info.email) setEmail(info.email);

    // 既に名簿に載っている人は入部申請そのものが不要。
    // メール未認証でも verify に流さず案内する (既存部員は招待経由で未認証のことがある)
    const me = await apiJson<{ id?: number; status?: MemberStatus }>("/portal/member/me", { method: "POST" }).catch(() => null);
    if (me?.id) {
      setStep(me.status === "pre-active" ? "done" : "member");
      return;
    }

    setStep(info.emailVerified ? "form" : "verify");
  };

  useEffect(() => {
    if (!readIdToken()) {
      setStep("account");
      return;
    }
    advanceAfterLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 大学 Google アカウントでログイン/新規登録する。Google は確認済みメールで来る
  const onGoogleCredential = async (credential: string) => {
    setMsg("");

    const res = await fetch(`${API_BASE}/user/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    const data: any = await res.json();

    if (!data.idToken || !data.refreshToken) {
      setMsg(`ログインに失敗しました。${data.message ?? data.error ?? ""}`);
      return;
    }

    storeTokens(data.idToken, data.refreshToken);
    setStep("loading");
    await advanceAfterLogin();
  };

  const onSendVerify = async () => {
    setMsg("");
    await apiJson("/user/verifyEmail", { method: "POST" }).catch(() => {});
    setMailSent(true);
    setMsg("確認メールを送信しました。");
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
      body: JSON.stringify({ name, furigana, birthday, tel: phone, hobby, wish, note }),
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
          <AccountStep onGoogleCredential={onGoogleCredential} />
        )}

        {step === "verify" && (
          <div>
            <p className={styles.description}>
              {mailSent ? (
                <>
                  {email} に確認メールを送りました。<br />
                  メール内のリンクを開いてから、下のボタンを押してください。
                </>
              ) : (
                <>
                  {email} のメールアドレスはまだ確認できていません。<br />
                  「確認メールを送る」を押し、メール内のリンクを開いてから「確認できたので次へ」を押してください。
                </>
              )}
            </p>
            <div className={portalStyles.inputGroup}>
              <button type="button" className={portalStyles.portal} onClick={onCheckVerified}>
                確認できたので次へ
              </button>
              <button type="button" className={portalStyles.portal} onClick={onSendVerify}>
                {mailSent ? "確認メールを再送" : "確認メールを送る"}
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
                <label>メールアドレス</label>
                {/* Google アカウントから取得。変更は「アカウントを切り替える」で */}
                <input type="email" className={portalStyles.portal} value={email} readOnly disabled />
              </div>
              <div className={portalStyles.field}>
                <label>学籍番号</label>
                {/* メールアドレスから自動で決まる。本人の申告には頼らない */}
                <input type="text" className={portalStyles.portal} value={email.split("@")[0]} readOnly disabled />
              </div>
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
                <label>趣味・特技（任意）</label>
                <textarea className={portalStyles.portal} rows={2} placeholder="あれば入力してください"
                  value={hobby} onChange={e => setHobby(e.target.value)} />
              </div>
              <div className={portalStyles.field}>
                <label>やってみたいこと（任意）</label>
                <textarea className={portalStyles.portal} rows={2} placeholder="あれば入力してください"
                  value={wish} onChange={e => setWish(e.target.value)} />
              </div>
              <div className={portalStyles.field}>
                <label>連絡先（携帯・任意）</label>
                <input type="tel" className={portalStyles.portal} placeholder="090-1234-5678"
                  value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className={portalStyles.field}>
                <label>連絡事項（任意）</label>
                <textarea className={portalStyles.portal} rows={2} placeholder="何かあれば必要に応じてご記入ください"
                  value={note} onChange={e => setNote(e.target.value)} />
              </div>

              <div className={portalStyles.editorActions}>
                <button type="button" className={portalStyles.portal} onClick={onSubmitForm}>申請する</button>
              </div>
            </div>
          </div>
        )}

        {step === "done" && (
          <p className={styles.description}>
            入部申請ありがとうございます！！<br />
            申請内容を確認後、部室に来ていただく時間帯の調整を行うため、「入部案内メール」をお送りします。<br />
            <br />
            確認まで数日お時間をいただく場合がありますので、ご案内までしばらくお待ちください。<br />
            <br />
            当日は入部届をお渡ししますので、その場でご記入いただくか、後日、部室へ提出していただいても構いません。<br />
            <br />
            （仮登録が完了しました。承認されると、ポータルの各機能が使えるようになります。）
          </p>
        )}

        {step === "member" && (
          <div>
            <p className={styles.description}>
              あなたは既に部員として登録されています。入部申請は必要ありません。
            </p>
            <div className={portalStyles.inputGroup}>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a className={portalStyles.portal} href="/portal/">ポータルへ</a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

interface AccountStepProps {
  onGoogleCredential: (credential: string) => void;
}

// 大学 Google アカウントでログイン/新規登録する。
// パスワードは後からポータルの設定で任意に追加できる
const AccountStep = ({ onGoogleCredential }: AccountStepProps) => (
  <div>
    <p className={styles.description}>
      入部申請には、大学から配布された Googleアカウントでのログインが必要です。<br />
      ボタンからGoogleアカウントでのログインをしてください。
    </p>

    <div className={portalStyles.memberEditor}>
      <GoogleLoginButton onCredential={onGoogleCredential} />
    </div>

    <p className={styles.description}>
      パスワードでログインしたい場合は、ログイン後にポータルの設定で追加できます。<br />
    </p>

    <p className={styles.description}>
      大学のGoogleアカウントがまだ使えない方は、部活動から招待コードを受け取り、
      <Link href="/register-by-code/">招待コードで登録</Link>することもできます。<br />
      登録後、あらためてこのページから入部申請を行ってください。
    </p>

    <p>
      また、このシステムが正常に動作しない場合は、<Link href="/blog/join/">入部の手続き</Link>をご覧ください。<br />
      従来のGoogleフォームからの申請も引き続き利用できます。
    </p>
  </div>
);

export default JoinPage;
