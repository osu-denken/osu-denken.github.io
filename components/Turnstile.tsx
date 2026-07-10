import { useEffect, useRef } from "react";

// Cloudflare ダッシュボードで作成したウィジェットのサイトキー。
// 公開してよい値なので既定に置く。環境変数があれば上書きする
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "0x4AAAAAADzU8OMZbrpKkJKb";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

// 一度読み込んだら使い回す。ページ内に複数あってもスクリプトは1つでよい
let scriptPromise: Promise<void> | null = null;

const loadScript = (): Promise<void> => {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile"));
    document.head.appendChild(script);
  });

  return scriptPromise;
};

interface TurnstileProps {
  onToken: (token: string) => void;
}

/**
 * Cloudflare Turnstile のウィジェット。人間確認のトークンを親へ渡す。
 * サイトキー未設定 (ローカル開発など) では何も描画しない。
 */
export const Turnstile = ({ onToken }: TurnstileProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;

    let widgetId: string | null = null;

    loadScript()
      .then(() => {
        if (!ref.current || !window.turnstile) return;
        widgetId = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          callback: (token: string) => onToken(token),
        });
      })
      .catch(e => console.error(e));

    return () => {
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onToken]);

  return <div ref={ref} style={{ margin: "0.5rem 0" }} />;
};
