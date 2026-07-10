import { useEffect, useRef, useState } from "react";
import styles from "@styles/Page.module.css";
import portalStyles from "@styles/Portal.module.css";
import { apiFetch, apiJson } from "@lib/api";

interface ImageTabProps {
  setMsg: (msg: string) => void;
}

interface BlogImage {
  name: string;
  sha: string;
  size: number;
  /** ブログリポジトリ内のパス (例: /images/foo.png) */
  url: string;
}

// ブログは同一オリジンの /blog 配下に配信されるので、記事から参照するパスもここが基準になる
const BLOG_BASE = "/blog";

const imageSrc = (image: BlogImage) => `${BLOG_BASE}${image.url}`;
const markdownFor = (image: BlogImage) => `![${image.name}](${BLOG_BASE}${image.url})`;

const formatSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

export const ImageTab = ({ setMsg }: ImageTabProps) => {
  const [images, setImages] = useState<BlogImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    apiJson<BlogImage[]>("/v1/image/list", { method: "GET" })
      .then(data => setImages(Array.isArray(data) ? data : []))
      .catch(e => {
        console.error("Failed to load image list:", e);
        setMsg("画像一覧の取得に失敗しました。");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || uploading) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setMsg(`${file.name} は画像ではありません。`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await apiFetch("/v1/image/upload", { method: "POST", body: formData });
        const data: any = await res.json();

        if (!res.ok || !data?.success) {
          console.error("Failed to upload image:", data);
          setMsg(`${file.name} のアップロードに失敗しました。`);
          continue;
        }

        setMsg(`${data.name} をアップロードしました。`);
      }
      load();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onDelete = async (image: BlogImage) => {
    if (!confirm(`${image.name} を削除しますか？\n記事から参照されている場合は表示されなくなります。`)) return;

    try {
      const data: any = await apiJson("/v1/image/delete", {
        method: "POST",
        body: JSON.stringify({ filename: image.name, sha: image.sha })
      });

      if (!data?.success) {
        setMsg("削除に失敗しました。");
        return;
      }

      setMsg(`${image.name} を削除しました。`);
      setImages(prev => prev.filter(i => i.sha !== image.sha));
    } catch (e) {
      console.error("Failed to delete image:", e);
      setMsg("削除に失敗しました。");
    }
  };

  const onCopy = async (image: BlogImage) => {
    try {
      await navigator.clipboard.writeText(markdownFor(image));
      setMsg("Markdown をコピーしました。");
    } catch {
      setMsg("コピーできませんでした。");
    }
  };

  return (
    <div className={portalStyles.tabPane}>
      <h1>画像</h1>
      <p className={styles.description}>
        ブログ記事で使う画像を管理します。リポジトリにコミットとして残るため、公開して問題のない画像だけをアップロードしてください。
      </p>

      <div className={portalStyles.inputGroup}>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className={portalStyles.portal}
          disabled={uploading}
          onChange={e => onUpload(e.target.files)} />
      </div>

      {uploading && <p>アップロード中...</p>}

      {loading ? (
        <p>読み込み中...</p>
      ) : images.length === 0 ? (
        <p>画像がまだありません。</p>
      ) : (
        <div className={portalStyles.imageGrid}>
          {images.map(image => (
            <div key={image.sha} className={portalStyles.imageCard}>
              <img src={imageSrc(image)} alt={image.name} className={portalStyles.imageThumb} />
              <div className={portalStyles.imageMeta}>
                <span title={image.name}>{image.name}</span>
                <span className={portalStyles.hint}>{formatSize(image.size)}</span>
              </div>
              <div className={portalStyles.inputGroup}>
                <button type="button" className={portalStyles.portal} onClick={() => onCopy(image)}>
                  コピー
                </button>
                <button
                  type="button"
                  className={portalStyles.portal}
                  style={{ backgroundColor: "#a66666" }}
                  onClick={() => onDelete(image)}>
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
