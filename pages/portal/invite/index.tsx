import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

const InvitePage : NextPage = () => {



  useEffect(() => {
    const token = localStorage.getItem("idToken");

    if (!token) {
      const encoded = encodeURIComponent("portal/invite/");
      window.location.href = "/?i=" + encoded + "#login";
    }
  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>招待コードの作成</h1>
        <p className={styles.description}>
          ユーザーを新たに作成するための1回限りの24時間以内に有効な招待コードを作成することができます。<br />
          Webシステムのユーザーを持っていない部員にURLを共有してユーザーを作成します。<br />
          <br />
          コードは一度使用されると無効となります。<br />
        </p>

        <code id="invite-url" style={{display: "none", fontSize: 15, padding: 9, width: 450}}></code>
        <button className={portalStyles.portal} style={{display: "none", marginLeft: "4px"}} id="invite-copy-button" onClick={(e) => {
          const inviteUrlElement = document.getElementById("invite-url") as HTMLInputElement;
          const inviteLink = inviteUrlElement.textContent || "";
          navigator.clipboard.writeText(inviteLink).then(() => {
            alert("招待リンクをクリップボードにコピーしました。");
          });
        }}>コピー</button>
        <br /><br />
        <canvas id="invite-qrcode" style={{display: "none"}}></canvas>
        <br />

        <button onClick={(e) => {
          e.preventDefault();
          fetch("https://api.osudenken4dev.workers.dev/invite/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("idToken")}`
            }
          })
            .then(res => res.json())
            .then((data: any) => {
              if (data.success) {
                const inviteLink = "https://osu-denken.github.io/_register/?code=" + data.code;
                const inviteUrlElement = document.getElementById("invite-url") as HTMLInputElement;
                const inviteQrCodeElement = document.getElementById("invite-qrcode") as HTMLCanvasElement;

                inviteUrlElement.style.display = "inline";
                inviteUrlElement.textContent = inviteLink;

                inviteQrCodeElement.style.display = "block";
                QRCode.toCanvas(inviteQrCodeElement, inviteLink, function (e) {
                  if (e) console.error(e);
                  else console.log("QR code generated!");
                });

                const inviteCopyButton = document.getElementById("invite-copy-button") as HTMLButtonElement;
                inviteCopyButton.style.display = "inline";
              } else {
                alert("招待リンクの作成に失敗しました。");
              }
            })
            .catch(error => {
              console.error("Error:", error);
              alert("招待リンクの作成中にエラーが発生しました。");
            });
        }} className={portalStyles.portal}>招待コードを作成する</button>
      </main>
    </div>
  );
};

export default InvitePage;
