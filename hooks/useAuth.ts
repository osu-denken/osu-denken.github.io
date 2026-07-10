import { useState, useEffect, useCallback } from 'react';
import { API_BASE, clearTokens, readIdToken, refreshIdToken, storeTokens } from '@lib/api';

// 認証APIからのレスポンスの型定義
interface AuthResponse {
  idToken?: string;
  refreshToken?: string;
  displayName?: string;
  message?: string;
}

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

  // ログイン処理
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data: AuthResponse = await response.json();

      if (!data.idToken || !data.refreshToken) {
        console.log(data);
        if (data.message === 'INVALID_LOGIN_CREDENTIALS') {
          alert('学籍番号またはパスワードが間違っています。');
          return;
        }
        alert('ログイン失敗: ' + (data.message || '不明なエラー'));
        return;
      }

      storeTokens(data.idToken, data.refreshToken);
      localStorage.setItem('displayName', resolveDisplayName(data, email));

      redirectAfterLogin();
    } catch (error) {
      console.error('Error:', error);
      alert('ログイン中にエラーが発生しました。');
    }
  }, []);

  const getIdToken = useCallback(() => readIdToken(), []);

  return { isLoggedIn, userName, login, logout, refreshToken, getIdToken };
};
