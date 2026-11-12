import { useState } from "react";
import { Icon } from "@iconify/react";
import portalStyles from "@styles/Portal.module.css";
import { parseWorks, Work, WorkLink, WORK_ICON_OPTIONS } from "@lib/works";

interface WorksEditorProps {
  works: Work[];
  onChange: (works: Work[]) => void;
  selectedId?: number;
}

const emptyWork = (id: number): Work => ({
  id,
  title: "",
  overview: "",
  description: "",
  createdAt: "",
  updatedAt: "",
  category: "",
  tags: [],
  author: "",
  links: [],
  images: [],
});

const nextId = (works: Work[]) => works.reduce((max, work) => Math.max(max, work.id), 0) + 1;

export const WorksEditor = ({ works, onChange, selectedId }: WorksEditorProps) => {
  const [jsonMode, setJsonMode] = useState(false);
  const [json, setJson] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [openIconPicker, setOpenIconPicker] = useState<string | null>(null);

  const visibleWorks = works
    .map((work, index) => ({ work, index }))
    .filter(item => selectedId === undefined || item.work.id === selectedId);

  const patch = (index: number, changes: Partial<Work>) =>
    onChange(works.map((work, i) => i === index ? { ...work, ...changes } : work));

  const patchLink = (workIndex: number, linkIndex: number, changes: Partial<WorkLink>) => {
    const work = works[workIndex];
    const links = (work.links ?? []).map((link, i) => i === linkIndex ? { ...link, ...changes } : link);
    patch(workIndex, { links });
  };

  const removeLink = (workIndex: number, linkIndex: number) => {
    const links = (works[workIndex].links ?? []).filter((_, i) => i !== linkIndex);
    patch(workIndex, { links });
  };

  const openJson = () => {
    setJson(JSON.stringify(works, null, 2));
    setJsonError("");
    setJsonMode(true);
  };

  const applyJson = () => {
    try {
      onChange(parseWorks(json, { allowIncomplete: true }));
      setJsonMode(false);
      setJsonError("");
    } catch (e: any) {
      setJsonError(e?.message ?? "JSON を読めませんでした。");
    }
  };

  if (jsonMode) {
    return (
      <div className={portalStyles.memberEditor}>
        {jsonError && <div className={portalStyles.notice}>{jsonError}</div>}
        <textarea className={portalStyles.jsonEditor} value={json}
          onChange={e => setJson(e.target.value)} spellCheck={false} />
        <div className={portalStyles.editorActions}>
          <button type="button" className={portalStyles.portal} onClick={applyJson}>フォームに戻す</button>
          <button type="button" className={portalStyles.portal} onClick={() => setJsonMode(false)} style={{ marginLeft: "auto" }}>破棄</button>
        </div>
      </div>
    );
  }

  return (
    <div className={portalStyles.memberEditor}>
      {visibleWorks.map(({ work, index }) => (
        <section key={work.id} className={portalStyles.editorSection}>
          <h4>#{work.id} {work.title || "新しい作品"}</h4>

          <div className={portalStyles.fieldGrid}>
            <div className={portalStyles.field}>
              <label>タイトル *</label>
              <input type="text" className={portalStyles.portal} value={work.title}
                onChange={e => patch(index, { title: e.target.value })} />
            </div>
            <div className={portalStyles.field}>
              <label>作者</label>
              <input type="text" className={portalStyles.portal} value={work.author ?? ""}
                onChange={e => patch(index, { author: e.target.value || undefined })} placeholder="個人名・チーム名" />
            </div>
            <div className={portalStyles.field}>
              <label>カテゴリ</label>
              <input type="text" className={portalStyles.portal} value={work.category ?? ""}
                onChange={e => patch(index, { category: e.target.value || undefined })} placeholder="ゲーム、Webアプリなど" />
            </div>
            <div className={portalStyles.field}>
              <label>タグ (カンマ区切り)</label>
              <input type="text" className={portalStyles.portal} value={(work.tags ?? []).join(", ")}
                onChange={e => patch(index, { tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
            </div>
          </div>

          <div className={portalStyles.fieldGrid}>
            <div className={portalStyles.field}>
              <label>制作日</label>
              <input type="date" className={portalStyles.portal} value={work.createdAt ?? ""}
                onChange={e => patch(index, { createdAt: e.target.value })} />
            </div>
            <div className={portalStyles.field}>
              <label>更新日</label>
              <input type="date" className={portalStyles.portal} value={work.updatedAt ?? ""}
                onChange={e => patch(index, { updatedAt: e.target.value })} />
            </div>
          </div>

          <div className={portalStyles.field}>
            <label>概要</label>
            <input type="text" className={portalStyles.portal} value={work.overview ?? ""}
              onChange={e => patch(index, { overview: e.target.value || undefined })} style={{ width: "100%" }} />
          </div>

          <div className={portalStyles.field}>
            <label>説明 (HTML可。改行は &lt;br /&gt;)</label>
            <textarea className={portalStyles.textArea} rows={4} value={work.description ?? ""}
              onChange={e => patch(index, { description: e.target.value || undefined })} />
          </div>

          <div className={portalStyles.field}>
            <label>画像URL (1行に1つ)</label>
            <textarea className={portalStyles.textArea} rows={3} value={work.images.join("\n")}
              onChange={e => patch(index, { images: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) })} />
          </div>

          <div className={portalStyles.field}>
            <label>リンク</label>
            {(work.links ?? []).map((link, linkIndex) => {
              const pickerId = `${work.id}-${linkIndex}`;
              const selectedIcon = WORK_ICON_OPTIONS.find(option => option.value === link.icon);

              return (
                <div key={linkIndex} className={portalStyles.linkEditor}>
                  <div className={portalStyles.linkFields}>
                    <div className={portalStyles.field}>
                      <label>表示名 / ツールチップ</label>
                      <input type="text" className={portalStyles.portal} value={link.label}
                        onChange={e => patchLink(index, linkIndex, { label: e.target.value })} />
                    </div>
                    <div className={portalStyles.field}>
                      <label>URL</label>
                      <input type="url" className={portalStyles.portal} value={link.url}
                        onChange={e => patchLink(index, linkIndex, { url: e.target.value })} />
                    </div>
                    <div className={portalStyles.field}>
                      <label>アイコン (任意)</label>
                      <div className={portalStyles.iconPicker}>
                        <button type="button" className={portalStyles.iconPickerTrigger}
                          aria-expanded={openIconPicker === pickerId}
                          onClick={() => setOpenIconPicker(openIconPicker === pickerId ? null : pickerId)}>
                          {selectedIcon ? <Icon icon={selectedIcon.icon} /> : <span>文字で表示</span>}
                          <span>{selectedIcon?.label ?? "アイコンなし"}</span>
                          <Icon icon="fa6-solid:chevron-down" />
                        </button>
                        {openIconPicker === pickerId && (
                          <div className={portalStyles.iconPickerMenu}>
                            <button type="button" className={portalStyles.iconPickerOption}
                              onClick={() => {
                                patchLink(index, linkIndex, { icon: undefined });
                                setOpenIconPicker(null);
                              }}>
                              <span className={portalStyles.iconPickerEmpty}>Aa</span>
                              <span>文字で表示</span>
                            </button>
                            {WORK_ICON_OPTIONS.map(option => (
                              <button type="button" className={portalStyles.iconPickerOption}
                                key={option.value}
                                aria-pressed={link.icon === option.value}
                                onClick={() => {
                                  patchLink(index, linkIndex, { icon: option.value });
                                  setOpenIconPicker(null);
                                }}>
                                <Icon icon={option.icon} />
                                <span>{option.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={portalStyles.linkActions}>
                    <button type="button" className={portalStyles.portal}
                      onClick={() => removeLink(index, linkIndex)}>リンクを削除</button>
                  </div>
                </div>
              );
            })}
            <div className={portalStyles.editorActions}>
              <button type="button" className={portalStyles.portal}
                onClick={() => patch(index, { links: [...(work.links ?? []), { label: "", url: "" }] })}>
                リンクを追加
              </button>
            </div>
          </div>

          {selectedId === undefined && (
            <div className={portalStyles.editorActions}>
              <button type="button" className={portalStyles.portal} style={{ backgroundColor: "#a66666" }}
                onClick={() => {
                  if (confirm("この作品を削除しますか？")) onChange(works.filter((_, i) => i !== index));
                }}>
                削除
              </button>
            </div>
          )}
        </section>
      ))}

      <div className={portalStyles.editorActions}>
        <button type="button" className={portalStyles.portal} onClick={openJson} style={{ marginLeft: "auto" }}>
          JSONで編集
        </button>
      </div>
    </div>
  );
};
