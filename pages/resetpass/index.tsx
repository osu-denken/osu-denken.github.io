import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { apiJson } from "@lib/api";

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
                apiJson("/user/resetPassword", {
                  method: "POST",
                  auth: false,
                  body: JSON.stringify({ email })
                })
                  .then(() => {
                    alert("パスワード再設定メールを送信しました。")
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