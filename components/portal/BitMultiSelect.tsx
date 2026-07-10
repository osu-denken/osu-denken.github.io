import { useEffect, useRef, useState } from "react";
import portalStyles from "@styles/Portal.module.css";

interface BitMultiSelectProps {
  /** [ビット, 表示名] の並び */
  entries: readonly [number, string][];
  value: number;
  disabled?: boolean;
  /** 何も選ばれていないときの表示 */
  placeholder?: string;
  onChange: (next: number) => void;
}

/**
 * ビットフラグを複数選択する。
 * 閉じているときは選択内容のサマリだけを見せ、縦のスペースを取らない。
 */
export const BitMultiSelect = ({ entries, value, disabled, placeholder, onChange }: BitMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // 外側のクリックと Esc で閉じる
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (entries.length === 0)
    return <p className={portalStyles.hint}>{placeholder ?? "選択できる項目はありません。"}</p>;

  const selected = entries.filter(([bit]) => value & bit);
  const summary = selected.map(([, label]) => label).join("・");

  return (
    <div className={portalStyles.multiSelect} ref={root}>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        className={`${portalStyles.multiSelectControl} ${open ? portalStyles.open : ""}`}
        onClick={() => setOpen(!open)}>
        <span className={selected.length ? "" : portalStyles.placeholder}>
          {summary || placeholder || "なし"}
        </span>
        <span className={portalStyles.caret} aria-hidden>▾</span>
      </button>

      {open && (
        <ul className={portalStyles.multiSelectMenu} role="listbox" aria-multiselectable>
          {entries.map(([bit, label]) => {
            const checked = Boolean(value & bit);

            return (
              <li key={bit}>
                <button
                  type="button"
                  role="option"
                  aria-selected={checked}
                  className={`${portalStyles.multiSelectOption} ${checked ? portalStyles.selected : ""}`}
                  onClick={() => onChange(checked ? value & ~bit : value | bit)}>
                  <span className={portalStyles.check} aria-hidden>{checked ? "✓" : ""}</span>
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
