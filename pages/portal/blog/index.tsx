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
import { useRouter } from "next/router";

const PortalPage : NextPage = () => {
  const ymd = new Date().toISOString().split('T')[0];

  const [action, setAction] = useState("new");
  const [msg, setMsg] = useState("");
  const [page, setPage] = useState("");
  const [source, setSource] = useState("");
  const [savedSource, setSavedSource] = useState("");
  
  const [_localStorage, _setLocalStorage] = useState<any>(null);

  const [blogData, setBlogData] = useState<any>(null);

  const isDirty = source !== savedSource;

  const router = useRouter();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;

      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (!isDirty) return;

      if (!confirm("変更が保存されていません。本当にページを離れますか？")) {
        router.events.emit("routeChangeError");
        throw "Route change aborted.";
      }
    };

    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [isDirty]);

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

    const page: string = params.get("page")
    if (page) setPage(page);

    if (action === "edit") {
      fetch("https://api.osudenken4dev.workers.dev/v1/blog/" + (page.startsWith("_") ? "get-static" + "?page=" + page.slice(1) : "get" + "?page=" + page), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      }).then(res => res.json()).then(data => {
        if (data && data.content) {
          setBlogData(data);
          setSource(data.content);
          setSavedSource(data.content);
        } else {
          const source = `---
title: "今日の活動報告"
date: ` + ymd + `
categories: []
tags: [活動報告]
layout: default
---

ここからMarkdown記法で本文を記述します。
`;
          setBlogData({content: source});
          setSource(source);
          setSavedSource(source);
        }
      });
    }
  }, []);

  const getPreviewSource = (src: string) => {
    return src.replace(/^---[\s\S]*?---\n?/, '');
  };

  const registerPaste = (cm: any) => {
    cm.on("paste", async (cmEvent: any, e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();

          const file = item.getAsFile();
          if (!file) return;

          try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("https://api.osudenken4dev.workers.dev/v1/image/upload", {
                method: "POST",
                headers: {
                  Authorization: "Bearer " + localStorage.getItem("idToken"),
                },
                body: formData,
              }
            );

            const data = await res.json();

            if (!data?.url) {
              alert("画像のアップロードに失敗しました");
              return;
            }

            const placeholder = `![image](uploading...)`;
            cm.replaceSelection(placeholder);
            const pos = cm.getCursor();

            const from = {line: pos.line, ch: pos.ch - placeholder.length};
            const to = {line: pos.line, ch: pos.ch};
            cm.replaceRange(`![image](/blog${data.url})`, from, to);
          } catch (err) {
            console.error(err);
            alert("画像のアップロード中にエラーが発生しました");
          }
        }
      }
    });
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
            <h1>{page.startsWith("_") ? "固定ページ " + page.slice(1) : page} の編集</h1>
            <form>
              <div className={portalStyles.inputGroup2}>
                <div className={portalStyles.mdeeditor}>
                  <ReactSimpleMdeEditor onChange={(str) => setSource(str)} value={source} className={portalStyles.portal} getMdeInstance={
                    (mde: any) => registerPaste(mde.codemirror)
                  }></ReactSimpleMdeEditor>
                </div>

                <div
                  className={`${portalStyles.mdepreview} markdown-body p-4 border border-gray-300 h-72 overflow-y-auto`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm, breaks]} rehypePlugins={[rehypeRaw]}>{getPreviewSource(source)}</ReactMarkdown>
                </div>
              </div>

              <div className={portalStyles.inputGroup}>
              <button type="button" className={portalStyles.portal} onClick={() => {
                fetch("https://api.osudenken4dev.workers.dev/v1/blog/" + (page.startsWith("_") ? "update-static" : "update"), {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("idToken"),
                    "page": page.startsWith("_") ? page.slice(1) : page
                  },
                  body: source,
                }).then(res => res.json()).then(data => {
                  if (data.success) {
                    setMsg("保存しました。");
                    setSavedSource(source);
                  } else {
                    setMsg("保存に失敗しました。");
                  }
                });
              }}>
                保存
              </button>
              <button type="button" className={portalStyles.portal} style={{ backgroundColor: "#a66666" }} onClick={() => {
                const confirmed = confirm("本当に削除しますか？");
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
                if (isDirty && !confirm("変更が保存されていません。本当にページを離れますか？"))
                  return;

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
