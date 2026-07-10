import { useState, useEffect, useCallback } from 'react';

// 認証APIからのレスポンスの型定義
interface AuthResponse {
  idToken?: string;
  refreshToken?: string;
  displayName?: string;
  // Firebase 直叩き時は { message } のオブジェクト、web-api 経由では識別名の文字列が入る
  error?: { message: string } | string;
  message?: string;
}

// AuthResponse.error の形が2種類あるので吸収する
const errorMessageOf = (data: AuthResponse): string | undefined => {
  if (typeof data.error === 'string') return data.message;
  return data.error?.message ?? data.message;
};

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string>('');

  // ログイン状態の初期チェック
  useEffect(() => {
    const token = localStorage.getItem('idToken');
    if (token) {
      setIsLoggedIn(true);
      setUserName(localStorage.getItem('displayName') || 'Unknown');
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // ログアウト処理
  const logout = useCallback(() => {
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('displayName');
    window.location.reload();
  }, []);

  // トークンリフレッシュ処理
  const refreshToken = useCallback(async (): Promise<string | null> => {
    const currentRefreshToken = localStorage.getItem('refreshToken');
    if (!currentRefreshToken) return null;

    try {
      const response = await fetch('https://api.osudenken4dev.workers.dev/user/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: currentRefreshToken,
        }),
      });

      const data: AuthResponse = await response.json();

      if (data.idToken && data.refreshToken) {
        localStorage.setItem('idToken', data.idToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return data.idToken;
      }

      console.error('Failed to refresh token:', data);
      // refreshToken 自体が無効なら保持していても無意味なので捨てる
      const message = errorMessageOf(data);
      if (message === 'INVALID_REFRESH_TOKEN' || message === 'TOKEN_EXPIRED') {
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('displayName');
      }
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }, []);
  
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
      const response = await fetch('https://api.osudenken4dev.workers.dev/user/login', {
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

      if (data.idToken) {
        let displayName = data.displayName;
        if (!displayName) {
          const atIndex = email.indexOf('@');
          displayName = atIndex !== -1 ? email.substring(0, atIndex) : email;
        }
        // XSS対策
        displayName = displayName.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        localStorage.setItem('idToken', data.idToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        localStorage.setItem('displayName', displayName);
        
        // ログイン後のリダイレクト処理
        const params = new URLSearchParams(window.location.search);
        const param_i = params.get('i');
        if (param_i) {
          window.location.href = '/' + param_i;
        } else {
          window.location.reload();
        }
      } else {
        console.log(data);
        const message = errorMessageOf(data);
        if (message === 'INVALID_LOGIN_CREDENTIALS') {
          alert('学籍番号またはパスワードが間違っています。');
        } else {
          alert('ログイン失敗: ' + (message || '不明なエラー'));
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('ログイン中にエラーが発生しました。');
    }
  }, []);

  const getIdToken = useCallback(() => {
    return localStorage.getItem('idToken');
  }, []);

  return { isLoggedIn, userName, login, logout, refreshToken, getIdToken };
};
