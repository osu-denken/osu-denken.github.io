import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import styles from "@styles/MultiSelect.module.css";

/** メニューの最大高さ。styles.menu と揃えること */
const MENU_MAX_HEIGHT = 224;

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
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const root = useRef<HTMLDivElement>(null);

  // ダイアログの overflow に切り取られないよう、メニューはビューポート基準で置く
  const placeMenu = useCallback(() => {
    const rect = root.current?.getBoundingClientRect();
    if (!rect) return;

    const below = window.innerHeight - rect.bottom;
    const dropUp = below < MENU_MAX_HEIGHT && rect.top > below;

    setMenuStyle({
      left: rect.left,
      width: rect.width,
      maxHeight: Math.min(MENU_MAX_HEIGHT, (dropUp ? rect.top : below) - 8),
      ...(dropUp
        ? { bottom: window.innerHeight - rect.top + 2 }
        : { top: rect.bottom + 2 }),
    });
  }, []);

  // 外側のクリックと Esc で閉じる。
  // モーダルの内側は stopPropagation することがあり、document まで届かないので捕捉フェーズで拾う
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      // 先に閉じるのはメニュー。モーダルはその次の Esc で閉じる
      if (e.key !== "Escape") return;

      e.stopPropagation();
      setOpen(false);
    };

    // メニューはビューポート基準なので、祖先がスクロールしたら追従させる
    const onReflow = () => placeMenu();

    document.addEventListener("mousedown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("scroll", onReflow, true);
    window.addEventListener("resize", onReflow);
    return () => {
      document.removeEventListener("mousedown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("scroll", onReflow, true);
      window.removeEventListener("resize", onReflow);
    };
  }, [open, placeMenu]);

  if (options.length === 0)
    return <p className={styles.empty}>{placeholder ?? "選択できる項目はありません。"}</p>;

  const isSelected = (value: T) => selected.includes(value);
  const summary = options.filter(o => isSelected(o.value)).map(o => o.label).join("/");

  const toggleOption = (value: T) =>
    onChange(isSelected(value) ? selected.filter(v => v !== value) : [...selected, value]);

  const toggleOpen = () => {
    if (!open) placeMenu();
    setOpen(!open);
  };

  return (
    <div className={styles.multiSelect} ref={root}>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        className={`${styles.control} ${open ? styles.open : ""}`}
        onClick={toggleOpen}>
        <span className={summary ? "" : styles.placeholder}>
          {summary || placeholder || "なし"}
        </span>
        <span className={styles.caret} aria-hidden>▾</span>
      </button>

      {open && (
        <ul className={styles.menu} style={menuStyle} role="listbox" aria-multiselectable>
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
