import portalStyles from "@styles/Portal.module.css";

interface BitMultiSelectProps {
  /** [ビット, 表示名] の並び */
  entries: readonly [number, string][];
  value: number;
  disabled?: boolean;
  onChange: (next: number) => void;
}

/**
 * ビットフラグを複数選択のドロップダウンで編集する。
 * select multiple は Ctrl 併用が要るため、選択済みは下にチップで示す。
 */
export const BitMultiSelect = ({ entries, value, disabled, onChange }: BitMultiSelectProps) => {
  const selected = entries.filter(([bit]) => value & bit);

  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = Array.from(e.target.selectedOptions)
      .reduce((bits, option) => bits | Number(option.value), 0);

    onChange(next);
  };

  if (entries.length === 0) return <p className={portalStyles.hint}>付与できる権限はありません。</p>;

  return (
    <div>
      <select
        multiple
        size={Math.min(entries.length, 6)}
        disabled={disabled}
        className={portalStyles.portal}
        value={selected.map(([bit]) => String(bit))}
        onChange={onSelectChange}>
        {entries.map(([bit, label]) => (
          <option key={bit} value={bit}>{label}</option>
        ))}
      </select>

      <p className={portalStyles.hint}>
        {selected.length ? selected.map(([, label]) => label).join("・") : "なし"}
        {!disabled && "（Ctrl / ⌘ + クリックで複数選択）"}
      </p>
    </div>
  );
};
