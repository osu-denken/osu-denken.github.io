import { useEffect, useRef } from "react";
import { GOOGLE_CLIENT_ID } from "@lib/config";

const GSI_SRC = "https://accounts.google.com/gsi/client";

interface GoogleLoginButtonProps {
  /** Google が発行した ID トークン (JWT) を受け取る */
  onCredential: (credential: string) => void;
}

// GIS スクリプトは一度だけ読み込む
const loadGis = (): Promise<void> =>
  new Promise((resolve, reject) => {
    const w = window as any;
    if (w.google?.accounts?.id) return resolve();

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load GIS")));
      return;
    }

    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load GIS"));
    document.head.appendChild(script);
  });

/**
 * 大学 Google アカウントでのログインボタン。
 * 押すと Google の ID トークンを取得し onCredential へ渡す (交換はサーバ側)。
 */
export const GoogleLoginButton = ({ onCredential }: GoogleLoginButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  // 再レンダリングで古いコールバックを掴まないよう、最新を参照する
  const cbRef = useRef(onCredential);
  cbRef.current = onCredential;

  useEffect(() => {
    let cancelled = false;

    loadGis()
      .then(() => {
        if (cancelled || !ref.current) return;

        const google = (window as any).google;
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (res: { credential?: string }) => {
            if (res.credential) cbRef.current(res.credential);
          }
        });

        google.accounts.id.renderButton(ref.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          text: "signin_with",
          locale: "ja"
        });
      })
      .catch(e => console.error("Google Identity Services の読み込みに失敗:", e));

    return () => { cancelled = true; };
  }, []);

  return <div ref={ref} />;
};

export default GoogleLoginButton;
