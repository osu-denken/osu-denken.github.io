import type { NextPage } from "next";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import breaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const ReactSimpleMdeEditor = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
import "easymde/dist/easymde.min.css";
import 'github-markdown-css/github-markdown.css';

const PortalPage : NextPage = () => {
  const ymd = new Date().toISOString().split('T')[0];

  const [action, setAction] = useState("new");
  const [msg, setMsg] = useState("");
  const [page, setPage] = useState("");
  const [source, setSource] = useState("");
  const [savedSource, setSavedSource] = useState("");
  
  const [blogData, setBlogData] = useState<any>(null);

  const isUploading = useRef(false);
  const cmRef = useRef<any>(null);

  const isDirty = source !== savedSource;
  const router = useRouter();

  const getPreviewSource = (src: string) =>
     src.replace(/^---[\s\S]*?---\n?/, '');

  // 初期処理
  useEffect(() => {    
    const token = localStorage.getItem("idToken");

    if (!token) {
      const encoded = encodeURIComponent("portal/blog/" + window.location.search);
      window.location.href = "/?i=" + encoded + "#login";
      return;
    }

    const params = new URLSearchParams(window.location.search);

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
      }).then(res => res.json()).then((data: any) => {
        if (data && data.content) {
          setBlogData(data);
          setSource(data.content);
          setSavedSource(data.content);
        } else {
          const defaultSource = `---
title: "今日の活動報告"
date: ` + ymd + `
tags: [活動報告]
author: osu-denken
layout: default
---

ここからMarkdown記法で本文を記述します。
`;
          setBlogData({content: defaultSource});
          setSource(defaultSource);
          setSavedSource(defaultSource);
        }
      });
    }
  }, []);

  // 保存されていないときの警告 (ブラウザの確認ダイアログと被るため一旦廃止)
  /*
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
  */

  // 画像貼り付けなど (Ctrl + V / D&D)
  useEffect(() => {
    if (!cmRef.current) return;
    const cm = cmRef.current;

    const uploadImage = async (file: File) => {
      if (isUploading.current) return;
      isUploading.current = true;
      
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("https://api.osudenken4dev.workers.dev/v1/image/upload", {
          method: "POST",
          headers: { Authorization: "Bearer " + localStorage.getItem("idToken") },
          body: formData,
        });
        const data: any = await res.json();
        if (!data?.url) { 
          isUploading.current = false;
          alert("アップロード失敗");
          return;
        }

        const placeholder = `![image](uploading...)`;
        const cursorPos = cm.getCursor();
        cm.replaceSelection(placeholder);
        const from = { line: cursorPos.line, ch: cursorPos.ch };
        const to = { line: cursorPos.line, ch: cursorPos.ch + placeholder.length };
        cm.replaceRange(`![image](/blog${data.url})`, from, to);
      } finally {
        isUploading.current = false;
      }
    };
    
    const handlePaste = (cmEvent: any, e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) 
            uploadImage(file);
          break;
        }
      }
    };

    const handleDrop = (cmEvent: any, e: DragEvent) => {
      const files = e.dataTransfer?.files;
      if (!files) return;
      e.preventDefault();
      Array.from(files).forEach(file => {
        if (file.type.startsWith("image/")) 
          uploadImage(file);
      });
    };

    cm.on("paste", handlePaste);
    cm.on("drop", handleDrop);

    return () => {
      cm.off("paste", handlePaste);
      cm.off("drop", handleDrop);
    };

  }, [cmRef.current]);

  return (
    <div className={styles.container}>
      <main className={styles.main} style={{width: "100%", maxWidth: "1600px"}}>
        
        {msg ? <div className={portalStyles.notice}>{msg}</div> : ``}

        {action === "new" ? (
          <div>
            <h1>新しく投稿</h1>
            <p>新しいブログ記事を作成します。リポジトリに変更履歴がコミットとして残るため、機密情報などを誤って記述しないよう気をつけてください。</p>

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
          </div>
        ) : (
          <div>
          <h1>{page.startsWith("_") ? "固定ページ " + page.slice(1) : page} の編集</h1>
            <div className={portalStyles.inputGroup2}>
              <div className={portalStyles.mdeeditor}>
                <ReactSimpleMdeEditor onChange={(str) => setSource(str)} value={source} className={portalStyles.portal} getMdeInstance={
                  (mde: any) => {
                    if (!cmRef.current) cmRef.current = mde.codemirror;
                  }
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
              }).then(res => res.json()).then((data: any) => {
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
              }).then(res => res.json()).then((data: any) => {
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
          </div>
        )}
      </main>
    </div>
  );
};

export default PortalPage;
