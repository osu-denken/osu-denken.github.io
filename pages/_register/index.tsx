import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import { useEffect, useState } from "react";

const DebugPage : NextPage = () => {
    const [_localStorage, _setLocalStorage] = useState<any>(null);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const email = form.get("email") as string;
        const password = form.get("password") as string;
        const passphrase = form.get("passphrase") as string;

        fetch("https://api.osudenken4dev.workers.dev/user/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password,
                passphrase
            })
        }).then(res => res.json()).then(data => {
            if (data.error) {
                if (data.error.message === "EMAIL_EXISTS") {
                    alert("そのメールアドレスは既に使われています。");
                    return;
                }
                console.error("Registration error:", data);
                return;
            }

            
            if (data.body && data.body.error === "Invalid passphrase") {
                alert("合言葉が間違っています。");
                return;
            }

            if (data.success) {
                alert("ユーザー登録が完了しました。ログインページに移動します。");
                window.location.href = "/?i=portal/#login";
            } else {
                console.error("Registration failed:", data);
                alert("ユーザー登録に失敗しました。");
            }
        });
    }

    useEffect(() => {
        _setLocalStorage(localStorage);
        if (localStorage.getItem("idToken")) {
            alert("すでにログインしているため、ポータルページに移動します。");
            window.location.href = "/portal";
        }

        // 招待コード ?code=... があるときは合言葉は非表示にする。
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code) {
            fetch("https://api.osudenken4dev.workers.dev/invite/validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ code })
            }).then(res => res.json()).then(data => {
                if (!data.valid) {
                    alert("この招待コードは無効か期限切れです。");
                    return;
                }
            });

            const passphraseInput = document.querySelector('input[name="passphrase"]') as HTMLInputElement;
            if (passphraseInput) {
                passphraseInput.value = code;
                passphraseInput.style.display = "none";
                const passphraseLabel = document.getElementById("passphrase-label");
                if (passphraseLabel) {
                    passphraseLabel.style.display = "none";
                }
            }
        }
    }, []);

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <h1>新規ユーザー登録</h1>
                <p className={styles.description}>
                    大産大 電研部員のみが利用できるユーザーを作成します。<br />
                    なお、部員ではない場合は却下されます。
                </p>
                <form onSubmit={handleSubmit}>
                    <label>
                        学籍番号もしくはメールアドレス (osaka-sandai.ac.jpのみ)
                        <input type="text" name="email" />
                    </label>
                    <label>
                        パスワード
                        <input type="password" name="password" />
                    </label>
                    <label id="passphrase-label">
                        合言葉
                        <input type="text" name="passphrase" />
                    </label>
                    <br />
                    <input type="submit" value="作成する" />
                </form>

            </main>
        </div>
    );
};

export default DebugPage;