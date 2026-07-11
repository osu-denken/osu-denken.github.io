import { useEffect, useMemo, useRef, useState } from "react";
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
  /** アップロード日時 (ISO8601)。取得できない場合は null */
  uploadedAt: string | null;
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

type SortKey = "date" | "name" | "size";

const SORT_LABELS: Record<SortKey, string> = {
  date: "アップロード日時",
  name: "ファイル名",
  size: "ファイルサイズ"
};

const formatDate = (iso: string | null) => {
  if (!iso) return "日時不明";
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
  });
};

export const ImageTab = ({ setMsg }: ImageTabProps) => {
  const [images, setImages] = useState<BlogImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);

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

  const sortedImages = useMemo(() => {
    const dir = sortAsc ? 1 : -1;
    return [...images].sort((a, b) => {
      let cmp: number;
      if (sortKey === "size") {
        cmp = a.size - b.size;
      } else if (sortKey === "date") {
        // 日時不明 (null) は常に末尾へ寄せる
        const ta = a.uploadedAt ? Date.parse(a.uploadedAt) : null;
        const tb = b.uploadedAt ? Date.parse(b.uploadedAt) : null;
        if (ta === null && tb === null) cmp = 0;
        else if (ta === null) return 1;
        else if (tb === null) return -1;
        else cmp = ta - tb;
      } else {
        cmp = a.name.localeCompare(b.name, "ja");
      }
      return cmp * dir;
    });
  }, [images, sortKey, sortAsc]);

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

      {!loading && images.length > 0 && (
        <div className={portalStyles.inputGroup}>
          <select
            className={portalStyles.portal}
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}>
            {(Object.keys(SORT_LABELS) as SortKey[]).map(key => (
              <option key={key} value={key}>{SORT_LABELS[key]}</option>
            ))}
          </select>
          <button
            type="button"
            className={portalStyles.portal}
            onClick={() => setSortAsc(prev => !prev)}
            title={sortAsc ? "昇順" : "降順"}>
            {sortAsc ? "昇順 ↑" : "降順 ↓"}
          </button>
        </div>
      )}

      {loading ? (
        <p>読み込み中...</p>
      ) : images.length === 0 ? (
        <p>画像がまだありません。</p>
      ) : (
        <div className={portalStyles.imageGrid}>
          {sortedImages.map(image => (
            <div key={image.sha} className={portalStyles.imageCard}>
              <img src={imageSrc(image)} alt={image.name} className={portalStyles.imageThumb} />
              <div className={portalStyles.imageMeta}>
                <span title={image.name}>{image.name}</span>
                <span className={portalStyles.hint}>{formatSize(image.size)}</span>
                <span className={portalStyles.hint}>{formatDate(image.uploadedAt)}</span>
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
