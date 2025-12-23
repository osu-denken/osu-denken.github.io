import { useState, useEffect, useCallback } from 'react';

// 認証APIからのレスポンスの型定義
interface AuthResponse {
  idToken?: string;
  refreshToken?: string;
  displayName?: string;
  error?: {
    message: string;
  };
  message?: string;
}

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
        if (data.error) {
          if (data.error.message === 'INVALID_LOGIN_CREDENTIALS') {
            alert('学籍番号またはパスワードが間違っています。');
          } else {
            alert('ログイン失敗: ' + data.error.message);
          }
        } else {
          alert('ログイン失敗: ' + (data.message || '不明なエラー'));
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('ログイン中にエラーが発生しました。');
    }
  }, []);

  return { isLoggedIn, userName, login, logout };
};
