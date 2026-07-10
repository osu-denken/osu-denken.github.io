import { useState } from "react";
import portalStyles from "@styles/Portal.module.css";
import { parseWorks, Work } from "@lib/works";

interface WorksEditorProps {
  works: Work[];
  onChange: (works: Work[]) => void;
}

const nextId = (works: Work[]) => works.reduce((max, work) => Math.max(max, work.id), 0) + 1;

const emptyWork = (works: Work[]): Work => ({ id: nextId(works), title: "", images: [] });

/**
 * 作品リストのフォーム。
 * 生の JSON も編集できるようにしてあるが、壊れたまま保存できないよう検証を通す
 */
export const WorksEditor = ({ works, onChange }: WorksEditorProps) => {
  const [jsonMode, setJsonMode] = useState(false);
  const [json, setJson] = useState("");
  const [jsonError, setJsonError] = useState("");

  const patch = (index: number, changes: Partial<Work>) =>
    onChange(works.map((work, i) => (i === index ? { ...work, ...changes } : work)));

  const remove = (index: number) => {
    if (!confirm("この作品を削除しますか？")) return;
    onChange(works.filter((_, i) => i !== index));
  };

  const openJson = () => {
    setJson(JSON.stringify(works, null, 2));
    setJsonError("");
    setJsonMode(true);
  };

  const applyJson = () => {
    try {
      onChange(parseWorks(json));
      setJsonMode(false);
      setJsonError("");
    } catch (e: any) {
      setJsonError(e?.message ?? "JSON を読めませんでした。");
    }
  };

  if (jsonMode) {
    return (
      <div className={portalStyles.memberEditor}>
        {jsonError ? <div className={portalStyles.notice}>{jsonError}</div> : ``}

        <textarea
          className={portalStyles.jsonEditor}
          value={json}
          onChange={e => setJson(e.target.value)}
          spellCheck={false} />

        <div className={portalStyles.editorActions}>
          <button type="button" className={portalStyles.portal} onClick={applyJson}>フォームに戻す</button>
          <button type="button" className={portalStyles.portal} onClick={() => setJsonMode(false)}
            style={{ marginLeft: "auto" }}>
            破棄
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={portalStyles.memberEditor}>
      {works.map((work, index) => (
        <section key={work.id} className={portalStyles.editorSection}>
          <h4>#{work.id}</h4>

          <div className={portalStyles.fieldGrid}>
            <div className={portalStyles.field}>
              <label>タイトル</label>
              <input type="text" className={portalStyles.portal} value={work.title}
                onChange={e => patch(index, { title: e.target.value })} />
            </div>

            <div className={portalStyles.field}>
              <label>リンク</label>
              <input type="text" className={portalStyles.portal} value={work.link ?? ""}
                onChange={e => patch(index, { link: e.target.value || undefined })} />
            </div>
          </div>

          <div className={portalStyles.field}>
            <label>概要</label>
            <input type="text" className={portalStyles.portal} value={work.overview ?? ""}
              onChange={e => patch(index, { overview: e.target.value || undefined })} />
          </div>

          <div className={portalStyles.field}>
            <label>説明 (HTML可。改行は &lt;br /&gt;)</label>
            <textarea className={portalStyles.textArea} rows={3} value={work.description ?? ""}
              onChange={e => patch(index, { description: e.target.value || undefined })} />
          </div>

          <div className={portalStyles.field}>
            <label>画像URL (1行に1つ)</label>
            <textarea className={portalStyles.textArea} rows={3} value={work.images.join("\n")}
              onChange={e => patch(index, { images: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) })} />
          </div>

          <div className={portalStyles.editorActions}>
            <button type="button" className={portalStyles.portal} style={{ backgroundColor: "#a66666" }}
              onClick={() => remove(index)}>
              削除
            </button>
          </div>
        </section>
      ))}

      <div className={portalStyles.editorActions}>
        <button type="button" className={portalStyles.portal} onClick={() => onChange([...works, emptyWork(works)])}>
          作品を追加
        </button>
        <button type="button" className={portalStyles.portal} onClick={openJson} style={{ marginLeft: "auto" }}>
          JSONで編集
        </button>
      </div>
    </div>
  );
};
