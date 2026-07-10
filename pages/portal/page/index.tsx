import type { NextPage } from "next";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import breaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { apiJson, readIdToken } from "@lib/api";
import { sitePageOf } from "@lib/site-page";
import { parseWorks, Work } from "@lib/works";
import { WorksEditor } from "@components/portal/WorksEditor";

const ReactSimpleMdeEditor = dynamic(() => import("react-simplemde-editor"), { ssr: false });
import "easymde/dist/easymde.min.css";
import "github-markdown-css/github-markdown.css";

interface GetResponse {
  content?: string;
  message?: string;
}

interface UpdateResponse {
  success?: boolean;
  rebuildTriggered?: boolean;
  message?: string;
}

const SitePageEditor: NextPage = () => {
  const [path, setPath] = useState("");
  const [msg, setMsg] = useState("");
  const [source, setSource] = useState("");
  const [savedSource, setSavedSource] = useState("");
  const [works, setWorks] = useState<Work[]>([]);

  const page = sitePageOf(path);
  const isDirty = source !== savedSource;

  useEffect(() => {
    if (!readIdToken()) {
      const encoded = encodeURIComponent("portal/page/" + window.location.search);
      window.location.href = "/?i=" + encoded + "#login";
      return;
    }

    const target = new URLSearchParams(window.location.search).get("path") ?? "";
    setPath(target);

    if (!sitePageOf(target)) return;

    apiJson<GetResponse>(`/site-pages/get?path=${encodeURIComponent(target)}`, { method: "GET" })
      .then(data => {
        if (typeof data.content !== "string") throw new Error(data.message ?? "content is missing");

        setSource(data.content);
        setSavedSource(data.content);
        if (target.endsWith(".json")) setWorks(parseWorks(data.content));
      })
      .catch(e => {
        console.error("Failed to load site page:", e);
        setMsg("ページの取得に失敗しました。");
      });
  }, []);

  // フォームの変更を保存対象の JSON へ写す
  const onWorksChange = (next: Work[]) => {
    setWorks(next);
    setSource(JSON.stringify(next, null, 2) + "\n");
  };

  const onSave = () => {
    apiJson<UpdateResponse>("/site-pages/update", {
      method: "POST",
      body: JSON.stringify({ path, content: source }),
    })
      .then(data => {
        if (!data.success) {
          setMsg(`保存に失敗しました。${data.message ?? ""}`);
          return;
        }

        setSavedSource(source);

        // サイトの再ビルドを経て公開されるので、すぐには反映されない
        setMsg(data.rebuildTriggered
          ? "保存しました。サイトへの反映まで数分かかります。"
          : "保存しましたが、サイトの再ビルドを起動できませんでした。");
      })
      .catch(e => {
        console.error("Failed to save site page:", e);
        setMsg("保存に失敗しました。");
      });
  };

  const onCancel = () => {
    if (isDirty && !confirm("変更が保存されていません。本当にページを離れますか？")) return;

    window.location.href = "/portal/?tab=page";
  };

  if (!page) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1>ページ</h1>
          <p className={styles.description}>編集できるページではありません。</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.main} style={{ width: "100%", maxWidth: "1600px" }}>
        {msg ? <div className={portalStyles.notice}>{msg}</div> : ``}

        <h1>{page.label} の編集</h1>

        {page.kind === "works" ? (
          <WorksEditor works={works} onChange={onWorksChange} />
        ) : (
          <div className={portalStyles.inputGroup2}>
            <div className={portalStyles.mdeeditor}>
              <ReactSimpleMdeEditor value={source} onChange={setSource} className={portalStyles.portal} />
            </div>

            <div className={`${portalStyles.mdepreview} markdown-body p-4 border border-gray-300 h-72 overflow-y-auto`}>
              <ReactMarkdown remarkPlugins={[remarkGfm, breaks]} rehypePlugins={[rehypeRaw]}>{source}</ReactMarkdown>
            </div>
          </div>
        )}

        <div className={portalStyles.inputGroup}>
          <button type="button" className={portalStyles.portal} onClick={onSave}>保存</button>
          <button type="button" className={portalStyles.portal} style={{ marginLeft: "auto" }} onClick={onCancel}>
            キャンセル
          </button>
        </div>
      </main>
    </div>
  );
};

export default SitePageEditor;
