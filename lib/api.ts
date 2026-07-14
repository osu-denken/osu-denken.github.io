// export const API_BASE = "https://api.osudenken4dev.workers.dev";
// export const API_BASE = "https://api.osu-denken.net";
// もし今のドメインがosu-denken.netならそちらを使う。そうでなければosu-denken.github.ioを使う
export const API_BASE = window.location.hostname === "osu-denken.net" ? "https://api.osu-denken.net" : "https://api.osudenken4dev.workers.dev";

export const readIdToken = (): string | null => localStorage.getItem("idToken");
export const readRefreshToken = (): string | null => localStorage.getItem("refreshToken");

export function storeTokens(idToken: string, refreshToken: string) {
  localStorage.setItem("idToken", idToken);
  localStorage.setItem("refreshToken", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("idToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("displayName");
}

interface RefreshResponse {
  idToken?: string;
  refreshToken?: string;
  message?: string;
}

/**
 * refreshToken で idToken を取り直す
 * @returns 新しい idToken、失敗時は null
 */
export async function refreshIdToken(): Promise<string | null> {
  const currentRefreshToken = readRefreshToken();
  if (!currentRefreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/user/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: currentRefreshToken })
    });

    const data: RefreshResponse = await res.json();

    if (data.idToken && data.refreshToken) {
      storeTokens(data.idToken, data.refreshToken);
      return data.idToken;
    }

    // refreshToken 自体が無効なら保持していても無意味なので捨てる
    if (data.message === "INVALID_REFRESH_TOKEN" || data.message === "TOKEN_EXPIRED") clearTokens();

    console.error("Failed to refresh token:", data);
    return null;
  } catch (e) {
    console.error("Error refreshing token:", e);
    return null;
  }
}

export interface ApiInit extends RequestInit {
  /** Authorization ヘッダを付けるか (既定: true) */
  auth?: boolean;
}

function buildInit(init: ApiInit, idToken: string | null): RequestInit {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");

  if (init.auth !== false && idToken) headers.set("Authorization", `Bearer ${idToken}`);

  return { ...init, headers };
}

/**
 * web-api を叩く。401 が返ったら idToken を取り直して一度だけ再試行する。
 * @param path 先頭スラッシュ付きのパス
 * @param init fetch のオプション
 */
export async function apiFetch(path: string, init: ApiInit = {}): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, buildInit(init, readIdToken()));
  if (res.status !== 401 || init.auth === false) return res;

  const newIdToken = await refreshIdToken();
  if (!newIdToken) return res;

  return await fetch(`${API_BASE}${path}`, buildInit(init, newIdToken));
}

/**
 * apiFetch の結果を JSON として読む
 * @param path 先頭スラッシュ付きのパス
 * @param init fetch のオプション
 */
export async function apiJson<T = any>(path: string, init: ApiInit = {}): Promise<T> {
  const res = await apiFetch(path, init);
  return await res.json() as T;
}

/**
 * 再ログインを促してログインページへ送る
 */
export function redirectToLogin(returnTo: string) {
  alert("セッションの有効期限が切れました。再度ログインしてください。");
  window.location.href = `/?i=${returnTo}#login`;
}
