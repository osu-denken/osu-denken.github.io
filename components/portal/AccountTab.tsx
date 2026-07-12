import Link from "next/link";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { apiJson } from "@lib/api";
import { TotpSection } from "@components/portal/TotpSection";

interface AccountTabProps {
  userName: string;
  setUserName: (name: string) => void;
  setMsg: (msg: string) => void;
  hasTotp: boolean;
  recoveryCodesLeft: number;
}

/**
 * 成否だけを見る API 呼び出し。呼び出し元は false を受けて alert で回復する
 * @param label 失敗時のログに出す操作名
 * @param path 先頭スラッシュ付きのパス
 * @param init fetch のオプション
 */
async function requestSucceeded(label: string, path: string, init: RequestInit): Promise<boolean> {
  try {
    const data: any = await apiJson(path, init);

    if (!data.success) console.error(`Failed to ${label}.`, data);
    return Boolean(data.success);
  } catch (e) {
    console.error(`Failed to ${label}.`, e);
    return false;
  }
}

const updateUserData4api = (key: string, value: string) =>
  requestSucceeded(`update ${key}`, "/user/update", { method: "POST", body: JSON.stringify({ [key]: value }) });

/**
 * アカウント設定タブ。ユーザー名・パスワード・2要素認証。
 * 外部サービスとの連携は「連携」タブに分けた。
 */
export const AccountTab = ({ userName, setUserName, setMsg, hasTotp, recoveryCodesLeft }: AccountTabProps) => {
  const onChangeUserName = (e: React.MouseEvent) => {
    e.preventDefault();
    const input = document.getElementById("usernameInput") as HTMLInputElement;
    const newName = input.value.trim();
    if (!newName) {
      alert("有効なユーザー名を入力してください。");
      return;
    }

    updateUserData4api("displayName", newName).then(ok => {
      if (!ok) {
        alert("ユーザー名の更新に失敗しました。");
        return;
      }
      setMsg("ユーザー名を更新しました。");
      localStorage.setItem("displayName", newName);
    });
  };

  return (
    <div className={portalStyles.tabPane}>
      <h1>アカウント</h1>

      <h2>ユーザー名</h2>
      <p className={styles.description}>
        デフォルトでは学籍番号が設定されています。<br />変更する場合は以下の入力欄に新しいユーザー名を入力し、更新ボタンを押してください。
      </p>
      <form>
        <div className={portalStyles.inputGroup}>
          <input type="text" id="usernameInput" placeholder="ユーザー名" value={userName} onChange={(e) => setUserName(e.target.value)} className={portalStyles.portal} />
          <button onClick={onChangeUserName} className={portalStyles.portal}>変更</button>
        </div>
      </form>

      <h2 style={{ marginTop: "2rem" }}>パスワード</h2>
      <p className={styles.description}>
        パスワードの設定、再設定は<Link href="/resetpass/">こちら</Link>からメールアドレス宛の確認メールで行います。<br />
        Googleアカウントでアカウント作成した方も、パスワードを設定することで学籍番号とパスワードでログインできます。
      </p>

      <TotpSection hasTotp={hasTotp} recoveryCodesLeft={recoveryCodesLeft} setMsg={setMsg} />
    </div>
  );
};
