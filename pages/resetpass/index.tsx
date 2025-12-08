import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";

const ResetpassPage : NextPage = () => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>パスワードの再設定</h1>
        <p className={styles.description}>
          パスワードの再設定メールを送信するため、以下の入力欄にメールアドレスを入力して送信をクリックしてください。
        </p>

        <div className={portalStyles.inputGroup}>
          <form>
            <input type="text" id="email" placeholder="メールアドレス" className={portalStyles.portal}></input>
            <button onClick={(e) => {
              e.preventDefault();
              const input = document.getElementById("email") as HTMLInputElement;
              const email = input.value.trim() as string;
              if (email) {
                fetch("https://api.osudenken4dev.workers.dev/user/resetPassword", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    email: email
                  })
                })
                  .then(res => res.json())
                  .then(data => {
                    alert("パスワード再設定メールを送信しました。")
                    return true;
                  })
                  .catch(error => {
                    console.error("Error:", error);
                    alert("メールを送信できませんでした。");
                  });
              } else {
                alert("有効なメールアドレスを入力してください。");
              }
            }} className={portalStyles.portal}>送信</button>
          </form>
        </div>
        

      </main>
    </div>
  );
};

export default ResetpassPage;