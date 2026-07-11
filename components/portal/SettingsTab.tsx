import Link from "next/link";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { apiJson, storeTokens } from "@lib/api";
import { TotpSection } from "@components/portal/TotpSection";
import GoogleLoginButton from "@components/GoogleLoginButton";

interface SettingsTabProps {
  userName: string;
  setUserName: (name: string) => void;
  setMsg: (msg: string) => void;
  hasGitHubToken: boolean;
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

const updateGitHubToken = (value: string) =>
  requestSucceeded("update GitHub Token", "/github/token", { method: "POST", body: JSON.stringify({ githubToken: value }) });

const deleteGitHubToken = () =>
  requestSucceeded("delete GitHub Token", "/github/token", { method: "DELETE" });

export const SettingsTab = ({ userName, setUserName, setMsg, hasGitHubToken, hasTotp, recoveryCodesLeft }: SettingsTabProps) => {
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

  const onChangeGitHubToken = (e: React.MouseEvent) => {
    e.preventDefault();
    const input = document.getElementById("ghtokenInput") as HTMLInputElement;
    const newToken = input.value.trim();
    if (!newToken) {
      alert("有効なGitHub PATを入力してください。");
      return;
    }

    updateGitHubToken(newToken).then(ok => {
      if (!ok) {
        alert("GitHub PATの更新に失敗しました。");
        return;
      }
      setMsg("GitHub PATを更新しました。");
    });
  };

  const onLinkGoogle = async (credential: string) => {
    try {
      const data: any = await apiJson("/user/linkGoogle", { method: "POST", body: JSON.stringify({ credential }) });
      if (!data.success) {
        alert("Google 連携に失敗しました。" + (data.message ?? ""));
        return;
      }

      // 連携でトークンが再発行されるので、現在のセッションを更新しておく
      if (data.idToken && data.refreshToken) storeTokens(data.idToken, data.refreshToken);
      setMsg("Google アカウントを連携しました。次回からソーシャルログインも使えます。");
    } catch (e) {
      console.error("Failed to link Google.", e);
      alert("Google 連携に失敗しました。");
    }
  };

  const onDeleteGitHubToken = (e: React.MouseEvent) => {
    e.preventDefault();
    deleteGitHubToken().then(ok => {
      if (!ok) {
        alert("GitHub PATの削除に失敗しました。");
        return;
      }
      setMsg("GitHub PATを削除しました。");
    });
  };

  return (
    <div className={portalStyles.tabPane}>
      <h1>ユーザー設定</h1>
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

      <br />

      <h2>パスワード</h2>
      <p className={styles.description}>
        パスワードの設定、再設定は<Link href="/resetpass/">こちら</Link>からメールアドレス宛の確認メールで行います。<br />
        Googleアカウントでアカウント作成した方も、パスワードを設定することで学籍番号とパスワードでログインできます。
      </p>

      <h2>Google 連携</h2>
      <p className={styles.description}>
        大学 Google アカウントを連携すると、次回から学籍番号＋パスワードに加えてソーシャルログインも使えるようになります。
      </p>
      <div className={portalStyles.inputGroup}>
        <GoogleLoginButton onCredential={onLinkGoogle} />
      </div>

      <TotpSection hasTotp={hasTotp} recoveryCodesLeft={recoveryCodesLeft} setMsg={setMsg} />

      <h2>GitHub PAT</h2>
      <p className={styles.description}>
        デフォルトではosu-denken-adminのトークンを利用しますが、こちらを設定することで自身のGitHubアカウントとしてOSU-Denken-Web API経由でコミットすることが可能です。
      </p>
      <form>
        <div className={portalStyles.inputGroup}>
          <input type="text" id="ghtokenInput" placeholder="GitHub PAT" className={portalStyles.portal} />
          <button onClick={onChangeGitHubToken} className={portalStyles.portal}>変更</button>

          {hasGitHubToken &&
            <button onClick={onDeleteGitHubToken} className={portalStyles.portal}>削除</button>
          }
        </div>
      </form>

    </div>
  );
};
