import { MultiSelect } from "@components/MultiSelect";

interface BitMultiSelectProps {
  /** [ビット, 表示名] の並び */
  entries: readonly [number, string][];
  value: number;
  disabled?: boolean;
  placeholder?: string;
  onChange: (next: number) => void;
}

/**
 * ビットフラグを MultiSelect で編集する。
 * 立っているビットの集合と選択値の配列を相互に変換するだけの薄い層。
 */
export const BitMultiSelect = ({ entries, value, onChange, ...rest }: BitMultiSelectProps) => (
  <MultiSelect
    options={entries.map(([bit, label]) => ({ value: bit, label }))}
    selected={entries.map(([bit]) => bit).filter(bit => value & bit)}
    onChange={bits => onChange(bits.reduce((acc, bit) => acc | bit, 0))}
    {...rest} />
);
