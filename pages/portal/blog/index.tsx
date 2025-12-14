import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const ReactSimpleMdeEditor = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
import "easymde/dist/easymde.min.css";
import ReactMarkdown from "react-markdown";
import breaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import 'github-markdown-css/github-markdown.css';
import rehypeRaw from 'rehype-raw';

const PortalPage : NextPage = () => {
  const ymd = new Date().toISOString().split('T')[0];

  const [action, setAction] = useState("new");
  const [msg, setMsg] = useState("");
  const [page, setPage] = useState("");
  const [source, setSource] = useState("");
  
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
          setSource(data.content);
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
          setSource(blogData.content);
        }
      });
    }
  }, []);

  const getPreviewSource = (src: string) => {
    return src.replace(/^---[\s\S]*?---\n?/, '');
  };

  return (
    <div className={styles.container}>
      <main className={styles.main} style={{width: "100%", maxWidth: "1600px"}}>
        
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
              <div className={portalStyles.inputGroup} style={{width: "100%", height: "50vh", resize: "vertical", border: "1px solid #fff", borderRadius: 5 }}>
                <div style={{ width: "50%", borderRight: "1px solid #fff", overflowY: "auto", colorScheme: "dark" }}>
                  <ReactSimpleMdeEditor onChange={(str) => setSource(str)} value={source} className={portalStyles.portal}></ReactSimpleMdeEditor>
                </div>

                <div
                  className="markdown-body p-4 border border-gray-300 h-72 overflow-y-auto"
                  style={{ width: "50%", fontFamily: 'inherit', fontSize: 'inherit', overflowY: "auto", colorScheme: "dark" }} >
                  <ReactMarkdown remarkPlugins={[remarkGfm, breaks]} rehypePlugins={[rehypeRaw]}>{getPreviewSource(source)}</ReactMarkdown>
                </div>
              </div>

              

              <div className={portalStyles.inputGroup}>
              <button type="button" className={portalStyles.portal} onClick={() => {
                fetch("https://api.osudenken4dev.workers.dev/v1/blog/update", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("idToken"),
                    "page": page
                  },
                  body: source,
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
