import type { CSSProperties } from "react";
import portalStyles from "@styles/Portal.module.css";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  className?: string;
  style?: CSSProperties;
}

/**
 * 読み込み中のプレースホルダ。シマーが流れる矩形を描く。
 * width/height は CSS の値 (数値は px 扱い)。
 */
export const Skeleton = ({ width = "100%", height = "1rem", radius, className, style }: SkeletonProps) => (
  <span
    className={`${portalStyles.skeleton} ${className ?? ""}`}
    style={{ width, height, borderRadius: radius, ...style }}
    aria-hidden="true"
  />
);
