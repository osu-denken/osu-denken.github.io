import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { useEffect, useState } from "react";
import Link from "next/link";

const PortalPage : NextPage = () => {
  const ymd = new Date().toISOString().split('T')[0];


  const [action, setAction] = useState("new");
  const [msg, setMsg] = useState("");
  const [page, setPage] = useState("");
  
  const [info, setInfo] = useState<any>(null);
  const [_localStorage, _setLocalStorage] = useState<any>(null);

  const [blogData, setBlogData] = useState<any>(null);

  useEffect(() => {
    _setLocalStorage(localStorage);
    
    const token = localStorage.getItem("idToken");

    const params = new URLSearchParams(window.location.search);

    if (!token) {
      const encoded = encodeURIComponent("portal/blog/" + window.location.search);
      window.location.href = "/?i=" + encoded + "#login";
    }

    const msg = params.get("msg");
    if (msg) setMsg(msg);

    const action: any = params.get("action")
    if (action) setAction(action);

    const page: any = params.get("page")
    if (page) setPage(page);

    if (action === "edit") {
      fetch("https://api.osudenken4dev.workers.dev/v1/blog/get?page=" + page, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      }).then(res => res.json()).then(data => {
        if (data.content) {
          setBlogData(data);
        } else {
          setBlogData({content: `---
title: "今日の活動報告"
date: ` + ymd + `
categories: []
tags: [活動報告]
layout: default
---

ここからMarkdown記法で本文を記述します。
`})
        }
      });
    }
  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        
        {msg ? <div className={portalStyles.notice}>{msg}</div> : ``}

        {action === "new" ? (
          <div>
            <h1>新しく投稿</h1>
            <p>新しいブログ記事を作成します。</p>

            <form>
              <div className={portalStyles.inputGroup}>
                <input type="text" name="page" placeholder="ファイル名" className={portalStyles.portal} defaultValue={
                  new Date().toISOString().split('T')[0] + "-" + (new Date().getHours() + new Date().getMinutes() + new Date().getSeconds())
                } required />
                <button type="button" className={portalStyles.portal} onClick={() => {
                  const pageInput = document.querySelector('input[name="page"]') as HTMLInputElement;
                  const page = pageInput.value.trim();
                  if (!page) {
                    setMsg("ファイル名を入力してください。");
                    return;
                  }
                  const encoded = encodeURIComponent(page);
                  window.location.href = `/portal/blog/?action=edit&page=${encoded}`;
                }}>
                  編集
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <h1>{page} の編集</h1>
            <form>
              <div className={portalStyles.inputGroup}>
                <textarea name="content" style={{width: "100%", height: "50vh"}} className={portalStyles.portal} defaultValue={
                  blogData ? blogData["content"] : ""
                }></textarea>
              </div>
              <div className={portalStyles.inputGroup}>
              <button type="button" className={portalStyles.portal} onClick={() => {
                const contentInput = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                const content = contentInput.value;

                fetch("https://api.osudenken4dev.workers.dev/v1/blog/update", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("idToken"),
                    "page": page
                  },
                  body: content,
                }).then(res => res.json()).then(data => {
                  if (data.success) {
                    setMsg("保存しました。");
                  } else {
                    setMsg("保存に失敗しました。");
                  }
                });
              }}>
                保存
              </button>
              <button type="button" className={portalStyles.portal} style={{ backgroundColor: "#a66666" }} onClick={() => {
                const confirmed = confirm("本当に削除しますか？この操作は取り消せません。");
                if (!confirmed) return;

                fetch("https://api.osudenken4dev.workers.dev/blog/delete", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("idToken"),
                    "page": page
                  },
                }).then(res => res.json()).then(data => {
                  if (data.success) {
                    const encoded = encodeURIComponent("portal/blog/");
                    window.location.href = "/?msg=" + encodeURIComponent("削除しました。") + "&i=" + encoded + "#portal/blog";
                  } else {
                    setMsg("削除に失敗しました。");
                  }
                });
              }}>
                削除
              </button>
              <button type="button" className={portalStyles.portal} onClick={() => {
                window.location.href = "/portal/?tab=blog";
              }} style={{
                marginLeft: "auto",
              }}>
                キャンセル
              </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default PortalPage;
