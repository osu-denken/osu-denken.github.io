import type { NextPage } from "next";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import breaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { apiFetch, apiJson, readIdToken, redirectToLogin } from "@lib/api";
import { hasPermission, Permission } from "@lib/member";
import { PrivatePost } from "@lib/private-post";

const ReactSimpleMdeEditor = dynamic(() => import("react-simplemde-editor"), { ssr: false });
import "easymde/dist/easymde.min.css";
import "github-markdown-css/github-markdown.css";

/** 成功時は success、失敗時は web-api の HttpError が message を返す */
interface ApiResult {
  success?: boolean;
  message?: string;
}

const PrivatePostPage: NextPage = () => {
  const [permissions, setPermissions] = useState(0);
  const [msg, setMsg] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [savedSource, setSavedSource] = useState("");
  const [exists, setExists] = useState(false);

  const canEdit = hasPermission(permissions, Permission.PrivatePostEdit);
  const isDirty = source !== savedSource;

  useEffect(() => {
    if (!readIdToken()) {
      const encoded = encodeURIComponent("portal/private/" + window.location.search);
      window.location.href = "/?i=" + encoded + "#login";
      return;
    }

    const page = new URLSearchParams(window.location.search).get("page") ?? "";
    setSlug(page);
    setTitle(page);

    apiFetch("/portal", { method: "POST" })
      .then(async res => {
        if (res.status === 401) {
          redirectToLogin("portal/private/");
          return;
        }

        const data: any = await res.json();
        setPermissions(data.permissions ?? 0);
      })
      .catch(e => console.error("Failed to load portal:", e));

    if (!page) return;

    apiJson<{ post: PrivatePost }>("/private-posts/get", {
      method: "POST",
      body: JSON.stringify({ slug: page }),
    })
      .then(data => {
        setExists(true);
        setTitle(data.post.title);
        setSource(data.post.content);
        setSavedSource(data.post.content);
      })
      // 未作成のスラッグを開いたときは新規作成として扱う
      .catch(() => setExists(false));
  }, []);

  const onSave = () => {
    apiJson<ApiResult>("/private-posts/update", {
      method: "POST",
      body: JSON.stringify({ slug, title, content: source }),
    })
      .then(data => {
        // apiJson は HTTP のステータスを見ないので、成否は本文で判断する
        if (!data.success) {
          setMsg(`保存に失敗しました。${data.message ?? ""}`);
          return;
        }

        setExists(true);
        setSavedSource(source);
        setMsg("保存しました。");
      })
      .catch(e => {
        console.error("Failed to save private post:", e);
        setMsg("保存に失敗しました。");
      });
  };

  const onDelete = () => {
    if (!confirm("本当に削除しますか？")) return;

    apiJson<ApiResult>("/private-posts/delete", {
      method: "POST",
      body: JSON.stringify({ slug }),
    })
      .then(data => {
        if (!data.success) {
          setMsg(`削除に失敗しました。${data.message ?? ""}`);
          return;
        }

        window.location.href = "/portal/?tab=private";
      })
      .catch(e => {
        console.error("Failed to delete private post:", e);
        setMsg("削除に失敗しました。");
      });
  };

  const onCancel = () => {
    if (isDirty && !confirm("変更が保存されていません。本当にページを離れますか？")) return;

    window.location.href = "/portal/?tab=private";
  };

  if (!slug) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1>非公開記事</h1>
          <p className={styles.description}>ページが指定されていません。</p>
        </main>
      </div>
    );
  }

  if (permissions && !canEdit) {
    return (
      <div className={styles.container}>
        <main className={styles.main} style={{ width: "100%", maxWidth: "1600px" }}>
          <h1>{title}</h1>
          <div className={`${portalStyles.mdepreview} markdown-body`} style={{ width: "100%" }}>
            <ReactMarkdown remarkPlugins={[remarkGfm, breaks]} rehypePlugins={[rehypeRaw]}>{source}</ReactMarkdown>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.main} style={{ width: "100%", maxWidth: "1600px" }}>
        {msg ? <div className={portalStyles.notice}>{msg}</div> : ``}

        <h1>{slug} の編集</h1>

        <div className={portalStyles.inputGroup}>
          <input
            type="text"
            className={portalStyles.portal}
            placeholder="タイトル"
            value={title}
            onChange={e => setTitle(e.target.value)} />
        </div>

        <div className={portalStyles.inputGroup2}>
          <div className={portalStyles.mdeeditor}>
            <ReactSimpleMdeEditor value={source} onChange={setSource} className={portalStyles.portal} />
          </div>

          <div className={`${portalStyles.mdepreview} markdown-body p-4 border border-gray-300 h-72 overflow-y-auto`}>
            <ReactMarkdown remarkPlugins={[remarkGfm, breaks]} rehypePlugins={[rehypeRaw]}>{source}</ReactMarkdown>
          </div>
        </div>

        <div className={portalStyles.inputGroup}>
          <button type="button" className={portalStyles.portal} onClick={onSave}>保存</button>

          {exists && (
            <button type="button" className={portalStyles.portal} style={{ backgroundColor: "#a66666" }} onClick={onDelete}>
              削除
            </button>
          )}

          <button type="button" className={portalStyles.portal} style={{ marginLeft: "auto" }} onClick={onCancel}>
            キャンセル
          </button>
        </div>
      </main>
    </div>
  );
};

export default PrivatePostPage;
