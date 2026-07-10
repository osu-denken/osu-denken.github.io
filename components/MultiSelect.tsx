import { useEffect, useRef, useState } from "react";
import styles from "@styles/MultiSelect.module.css";

export interface MultiSelectOption<T> {
  value: T;
  label: string;
}

interface MultiSelectProps<T> {
  options: readonly MultiSelectOption<T>[];
  selected: readonly T[];
  disabled?: boolean;
  placeholder?: string;
  onChange: (next: T[]) => void;
}

/**
 * 複数選択のドロップダウン。
 * 閉じているときは選択内容のサマリだけを見せ、縦のスペースを取らない。
 */
export function MultiSelect<T extends string | number>({
  options,
  selected,
  disabled,
  placeholder,
  onChange,
}: MultiSelectProps<T>) {
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

  if (options.length === 0)
    return <p className={styles.empty}>{placeholder ?? "選択できる項目はありません。"}</p>;

  const isSelected = (value: T) => selected.includes(value);
  const summary = options.filter(o => isSelected(o.value)).map(o => o.label).join("・");

  const toggleOption = (value: T) =>
    onChange(isSelected(value) ? selected.filter(v => v !== value) : [...selected, value]);

  return (
    <div className={styles.multiSelect} ref={root}>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        className={`${styles.control} ${open ? styles.open : ""}`}
        onClick={() => setOpen(!open)}>
        <span className={summary ? "" : styles.placeholder}>
          {summary || placeholder || "なし"}
        </span>
        <span className={styles.caret} aria-hidden>▾</span>
      </button>

      {open && (
        <ul className={styles.menu} role="listbox" aria-multiselectable>
          {options.map(option => (
            <li key={String(option.value)}>
              <button
                type="button"
                role="option"
                aria-selected={isSelected(option.value)}
                className={`${styles.option} ${isSelected(option.value) ? styles.selected : ""}`}
                onClick={() => toggleOption(option.value)}>
                <span className={styles.check} aria-hidden>{isSelected(option.value) ? "✓" : ""}</span>
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
