import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { apiJson } from "@lib/api";

interface BlogTabProps {
  setMsg: (msg: string) => void;
}

interface BlogPage {
  name: string;
  sha: string;
  meta?: { title?: string; date?: string };
}

// 新規記事のファイル名の既定値 (例: 2026-07-10-a1b2c3)
const defaultPageName = () => {
  const today = new Date().toISOString().split("T")[0];
  return `${today}-${crypto.randomUUID().slice(0, 6)}`;
};

const editorHref = (page: string) => `/portal/blog/?action=edit&page=${encodeURIComponent(page)}`;

// タブを開き直すたびに取り直さないよう、一覧はモジュールスコープに残す
let cachedBlogList: BlogPage[] | null = null;

export const BlogTab = ({ setMsg }: BlogTabProps) => {
  const [blogList, setBlogList] = useState<BlogPage[]>(cachedBlogList ?? []);

  useEffect(() => {
    if (cachedBlogList) return;

    apiJson<BlogPage[]>("/v2/blog/list", { method: "GET", auth: false })
      .then(data => {
        cachedBlogList = data ?? [];
        setBlogList(cachedBlogList);
      })
      .catch(e => console.error("Failed to load blog list:", e));
  }, []);

  const onCreate = () => {
    const pageInput = document.querySelector('input[name="page"]') as HTMLInputElement;
    const page = pageInput.value.trim();
    if (!page) {
      setMsg("ファイル名を入力してください。");
      return;
    }

    window.location.href = editorHref(page);
  };

  return (
    <div className={portalStyles.tabPane}>
      <h1>ブログ</h1>
      <p className={styles.description}>
      </p>

      <form>
        <div className={portalStyles.inputGroup}>
          <input type="text" name="page" placeholder="ファイル名" className={portalStyles.portal} defaultValue={defaultPageName()} required />
          <button type="button" className={portalStyles.portal} onClick={onCreate}>
            新規作成
          </button>
        </div>
      </form>

      <p className={styles.description}>
        <Link href={editorHref("@welcome")}>トップページのターミナルに表示される welcome.md を編集する</Link>
      </p>

      <div className={portalStyles.grid}>
        {blogList.map((page) => (
          <Link key={page.sha} href={editorHref(page.name)}>
            <div className={portalStyles.card}>
              <h3>{page.meta?.title ? page.meta.title.slice(1, -1) : page.name}</h3>
              <p>{page.meta?.date ? new Date(page.meta.date).toLocaleDateString() : "-"}</p>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
};
