import { useEffect, useState } from "react";
import QRCode from "qrcode";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { apiJson } from "@lib/api";

interface TotpSectionProps {
  hasTotp: boolean;
  recoveryCodesLeft: number;
  setMsg: (msg: string) => void;
}

interface SetupResponse {
  success?: boolean;
  secret?: string;
  otpauthUrl?: string;
  message?: string;
}

interface EnableResponse {
  success?: boolean;
  recoveryCodes?: string[];
  error?: string;
}

export const TotpSection = ({ hasTotp, recoveryCodesLeft, setMsg }: TotpSectionProps) => {
  const [enabled, setEnabled] = useState(hasTotp);
  const [codesLeft, setCodesLeft] = useState(recoveryCodesLeft);

  // 有効化の途中でだけ持つ。有効化が済んだら捨てる
  const [secret, setSecret] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

  // 有効化直後に一度だけ見せるリカバリコード
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  // ポータルの情報は後から届くので、届いた時点の値に合わせる
  useEffect(() => {
    setEnabled(hasTotp);
    setCodesLeft(recoveryCodesLeft);
  }, [hasTotp, recoveryCodesLeft]);

  const onSetup = async () => {
    setBusy(true);
    try {
      const data: SetupResponse = await apiJson("/user/totp/setup", { method: "POST" });
      if (!data.success || !data.secret || !data.otpauthUrl) {
        setMsg("2段階認証の準備に失敗しました。");
        return;
      }

      setSecret(data.secret);
      setQrDataUrl(await QRCode.toDataURL(data.otpauthUrl, { margin: 2, width: 220 }));
    } catch (e) {
      console.error("Failed to setup 2FA:", e);
      setMsg("2段階認証の準備に失敗しました。");
    } finally {
      setBusy(false);
    }
  };

  const onEnable = async () => {
    setBusy(true);
    try {
      const data: EnableResponse = await apiJson("/user/totp/enable", {
        method: "POST",
        body: JSON.stringify({ code: code.trim() })
      });

      if (!data.success || !data.recoveryCodes) {
        setMsg(data.error === "MFA_INVALID_CODE" ? "認証コードが正しくありません。" : "2段階認証の有効化に失敗しました。");
        return;
      }

      setEnabled(true);
      setRecoveryCodes(data.recoveryCodes);
      setCodesLeft(data.recoveryCodes.length);
      setSecret("");
      setQrDataUrl("");
      setCode("");
      setMsg("2段階認証を有効にしました。");
    } catch (e) {
      console.error("Failed to enable 2FA:", e);
      setMsg("2段階認証の有効化に失敗しました。");
    } finally {
      setBusy(false);
    }
  };

  const onDisable = async () => {
    if (!confirm("2段階認証を解除しますか？")) return;

    setBusy(true);
    try {
      const data: EnableResponse = await apiJson("/user/totp/disable", {
        method: "POST",
        body: JSON.stringify({ code: code.trim() })
      });

      if (!data.success) {
        setMsg(data.error === "MFA_INVALID_CODE" ? "認証コードが正しくありません。" : "2段階認証の解除に失敗しました。");
        return;
      }

      setEnabled(false);
      setCode("");
      setRecoveryCodes([]);
      setMsg("2段階認証を解除しました。");
    } catch (e) {
      console.error("Failed to disable 2FA:", e);
      setMsg("2段階認証の解除に失敗しました。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h2>2段階認証</h2>

      {recoveryCodes.length > 0 && (
        <div className={portalStyles.notice}>
          <p>リカバリコードです。<strong>この画面を閉じると二度と表示されません。</strong>認証アプリを入れた端末を失ったときに使うので、印刷するかパスワードマネージャーに保存してください。</p>
          <pre className={portalStyles.recoveryCodes}>{recoveryCodes.join("\n")}</pre>
          <button type="button" className={portalStyles.portal} onClick={() => setRecoveryCodes([])}>
            控えたので閉じる
          </button>
        </div>
      )}

      {enabled ? (
        <>
          <p className={styles.description}>
            2段階認証は有効です。解除するには認証アプリのコード（またはリカバリコード）を入力してください。<br />
            残りのリカバリコード: {codesLeft} 個
          </p>
          <div className={portalStyles.inputGroup}>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="認証コード"
              className={portalStyles.portal}
              value={code}
              onChange={e => setCode(e.target.value)} />
            <button type="button" className={portalStyles.portal} style={{ backgroundColor: "#a66666" }} disabled={busy} onClick={onDisable}>
              解除
            </button>
          </div>
        </>
      ) : qrDataUrl ? (
        <>
          <p className={styles.description}>
            認証アプリでこの QR コードを読み取り、表示された6桁のコードを入力してください。
          </p>
          <img src={qrDataUrl} alt="TOTP QR コード" />
          <p className={portalStyles.hint}>
            QR コードを読み取れない場合は、次のキーを手で入力してください:<br />
            <code>{secret}</code>
          </p>
          <div className={portalStyles.inputGroup}>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="認証コード"
              className={portalStyles.portal}
              value={code}
              onChange={e => setCode(e.target.value)} />
            <button type="button" className={portalStyles.portal} disabled={busy} onClick={onEnable}>
              有効化
            </button>
          </div>
        </>
      ) : (
        <>
          <p className={styles.description}>
            パスワードに加えて認証アプリのワンタイムパスワードを求めるようにします。パスワードが漏れてもログインされにくくなります。
          </p>
          <button type="button" className={portalStyles.portal} disabled={busy} onClick={onSetup}>
            2段階認証を設定する
          </button>
        </>
      )}
    </>
  );
};
