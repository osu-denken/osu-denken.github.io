import { useState, useEffect, useCallback, useRef } from 'react';
import { getApiBase, clearTokens, readIdToken, refreshIdToken, storeTokens } from '@lib/api';

// 認証APIからのレスポンスの型定義
interface AuthResponse {
  idToken?: string;
  refreshToken?: string;
  displayName?: string;
  message?: string;
  /** HttpError のエラー識別名 (例: MFA_INVALID_CODE) */
  error?: string;
  /** 2段階認証が有効な場合、トークンの代わりにこれが返る */
  mfaRequired?: boolean;
  mfaPendingToken?: string;
}

/** ログインの結果。'mfa' なら認証コードの入力へ進む */
export type LoginResult = 'ok' | 'mfa' | 'error';

// ログイン時の表示名。未設定ならメールアドレスのローカル部を使う
const resolveDisplayName = (data: AuthResponse, email: string): string => {
  if (data.displayName) return data.displayName;

  const atIndex = email.indexOf('@');
  return atIndex !== -1 ? email.substring(0, atIndex) : email;
};

// ログイン後に戻る先。?i= が付いていればそこへ
const redirectAfterLogin = () => {
  const param_i = new URLSearchParams(window.location.search).get('i');
  if (param_i) {
    window.location.href = '/' + param_i;
    return;
  }
  window.location.reload();
};

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string>('');

  // ログイン状態の初期チェック
  useEffect(() => {
    const token = readIdToken();
    if (token) {
      setIsLoggedIn(true);
      setUserName(localStorage.getItem('displayName') || 'Unknown');
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // ログアウト処理
  const logout = useCallback(() => {
    clearTokens();
    window.location.reload();
  }, []);

  // トークンリフレッシュ処理
  const refreshToken = useCallback(() => refreshIdToken(), []);

  // 定期的なトークンリフレッシュ
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(() => {
        refreshToken();
      }, 55 * 60 * 1000); // 55 minutes

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, refreshToken]);

  // 2段階認証の待機トークンとログインに使ったメールアドレス。コード入力の間だけ保持する
  const mfaPendingToken = useRef<string | null>(null);
  const mfaEmail = useRef<string>('');

  const postJson = (path: string, body: unknown) =>
    fetch(`${getApiBase()}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  // ログイン成功時の共通処理
  const completeLogin = (data: AuthResponse, email: string) => {
    storeTokens(data.idToken!, data.refreshToken!);
    localStorage.setItem('displayName', resolveDisplayName(data, email));

    redirectAfterLogin();
  };

  // ログイン処理
  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await postJson('/user/login', { email, password });
      const data: AuthResponse = await response.json();

      // 2段階認証が有効な場合、トークンはコードを検証するまで発行されない
      if (data.mfaRequired && data.mfaPendingToken) {
        mfaPendingToken.current = data.mfaPendingToken;
        mfaEmail.current = email;
        return 'mfa';
      }

      if (!data.idToken || !data.refreshToken) {
        console.log(data);
        if (data.message === 'INVALID_LOGIN_CREDENTIALS') {
          alert('学籍番号またはパスワードが間違っています。');
          return 'error';
        }
        alert('ログイン失敗: ' + (data.message || '不明なエラー'));
        return 'error';
      }

      completeLogin(data, email);
      return 'ok';
    } catch (error) {
      console.error('Error:', error);
      alert('ログイン中にエラーが発生しました。');
      return 'error';
    }
  }, []);

  // 大学 Google アカウントでのログイン。GIS の ID トークンをサーバでトークンに交換する
  const loginWithGoogle = useCallback(async (credential: string): Promise<LoginResult> => {
    try {
      const response = await postJson('/user/google', { credential });
      const data: AuthResponse & { email?: string } = await response.json();

      if (data.mfaRequired && data.mfaPendingToken) {
        mfaPendingToken.current = data.mfaPendingToken;
        mfaEmail.current = data.email ?? '';
        return 'mfa';
      }

      if (!data.idToken || !data.refreshToken) {
        alert('Google ログインに失敗しました: ' + (data.message || data.error || '不明なエラー'));
        return 'error';
      }

      completeLogin(data, data.email ?? '');
      return 'ok';
    } catch (error) {
      console.error('Error:', error);
      alert('Google ログイン中にエラーが発生しました。');
      return 'error';
    }
  }, []);

  // 2段階認証のコード (またはリカバリコード) を検証する
  const submitTotp = useCallback(async (code: string): Promise<LoginResult> => {
    if (!mfaPendingToken.current) {
      alert('認証セッションが切れました。もう一度ログインしてください。');
      return 'error';
    }

    try {
      const response = await postJson('/user/loginTotp', {
        mfaPendingToken: mfaPendingToken.current,
        code,
      });

      const data: AuthResponse = await response.json();

      if (!data.idToken || !data.refreshToken) {
        if (data.error === 'MFA_INVALID_CODE') {
          alert('認証コードが正しくありません。');
          return 'mfa';
        }

        // 期限切れと試行回数超過は、待機トークンを捨ててログインからやり直してもらう
        mfaPendingToken.current = null;
        alert(data.error === 'MFA_TOO_MANY_ATTEMPTS'
          ? '試行回数が上限に達しました。もう一度ログインしてください。'
          : '認証セッションが切れました。もう一度ログインしてください。');
        return 'error';
      }

      completeLogin(data, mfaEmail.current);
      return 'ok';
    } catch (error) {
      console.error('Error:', error);
      alert('認証中にエラーが発生しました。');
      return 'error';
    }
  }, []);

  const getIdToken = useCallback(() => readIdToken(), []);

  return { isLoggedIn, userName, login, loginWithGoogle, submitTotp, logout, refreshToken, getIdToken };
};
