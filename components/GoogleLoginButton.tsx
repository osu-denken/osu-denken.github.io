import { useEffect, useRef } from "react";
import { GOOGLE_CLIENT_ID } from "@lib/config";

const GSI_SRC = "https://accounts.google.com/gsi/client";

interface GoogleLoginButtonProps {
  /** Google が発行した ID トークン (JWT) を受け取る */
  onCredential: (credential: string) => void;
  /** Google Identity Services を利用できない場合 */
  onUnavailable?: () => void;
}

// GIS スクリプトは一度だけ読み込む
const loadGis = (): Promise<boolean> =>
  new Promise(resolve => {
    const w = window as any;
    if (w.google?.accounts?.id) return resolve(true);

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

/**
 * 大学 Google アカウントでのログインボタン。
 * 押すと Google の ID トークンを取得し onCredential へ渡す (交換はサーバ側)。
 */
export const GoogleLoginButton = ({ onCredential, onUnavailable }: GoogleLoginButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  // 再レンダリングで古いコールバックを掴まないよう、最新を参照する
  const cbRef = useRef(onCredential);
  cbRef.current = onCredential;
  const unavailableRef = useRef(onUnavailable);
  unavailableRef.current = onUnavailable;

  useEffect(() => {
    let cancelled = false;

    loadGis()
      .then(loaded => {
        if (cancelled) return;
        if (!loaded || !ref.current) {
          unavailableRef.current?.();
          return;
        }

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
      .catch(() => {
        if (!cancelled) unavailableRef.current?.();
      });

    return () => { cancelled = true; };
  }, []);

  return <div ref={ref} />;
};

export default GoogleLoginButton;
