import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { apiJson } from "@lib/api";
import { dateLabel, hasPermission, Permission } from "@lib/member";
import { defaultSlug, PrivatePostSummary, privatePostHref } from "@lib/private-post";

interface PrivatePostTabProps {
  permissions: number;
  setMsg: (msg: string) => void;
}

export const PrivatePostTab = ({ permissions, setMsg }: PrivatePostTabProps) => {
  const [posts, setPosts] = useState<PrivatePostSummary[]>([]);
  const [slug, setSlug] = useState(defaultSlug);

  const canEdit = hasPermission(permissions, Permission.PrivatePostEdit);

  useEffect(() => {
    apiJson<{ posts: PrivatePostSummary[] }>("/private-posts/list", { method: "POST" })
      .then(data => setPosts(data.posts ?? []))
      .catch(e => {
        console.error("Failed to load private posts:", e);
        setMsg("非公開記事の取得に失敗しました。");
      });
  }, [setMsg]);

  const onCreate = () => {
    const page = slug.trim();
    if (!page) {
      setMsg("ファイル名を入力してください。");
      return;
    }

    window.location.href = privatePostHref(page);
  };

  return (
    <div className={portalStyles.tabPane}>
      <h1>非公開記事</h1>
      <p className={styles.description}>
        部員だけが読める記事です。GitHubのリポジトリではなくCloudflareに保存されるため、公開サイトには出ません。
      </p>

      {canEdit && (
        <div className={portalStyles.inputGroup}>
          <input
            type="text"
            className={portalStyles.portal}
            placeholder="ファイル名"
            value={slug}
            onChange={e => setSlug(e.target.value)} />
          <button type="button" className={portalStyles.portal} onClick={onCreate}>
            新規作成
          </button>
        </div>
      )}

      <div className={portalStyles.grid}>
        {posts.map(post => (
          <Link key={post.id} href={privatePostHref(post.slug)}>
            <div className={portalStyles.card}>
              <h3>{post.title}</h3>
              <p>{dateLabel(post.updatedAt)} / {post.authorName}</p>
            </div>
          </Link>
        ))}
      </div>

      {posts.length === 0 && <p className={styles.description}>まだ非公開記事はありません。</p>}
    </div>
  );
};
