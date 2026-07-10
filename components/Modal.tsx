import { ReactNode, useEffect } from "react";
import styles from "@styles/Modal.module.css";

interface ModalProps {
  title: ReactNode;
  children: ReactNode;
  onClose: () => void;
}

/**
 * 背景クリックと Esc で閉じるダイアログ。
 */
export const Modal = ({ title, children, onClose }: ModalProps) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    // 背後の一覧がスクロールしてしまうのを防ぐ
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal
        onMouseDown={e => e.stopPropagation()}>
        <header className={styles.header}>
          <h3>{title}</h3>
          <button type="button" className={styles.close} onClick={onClose} aria-label="閉じる">×</button>
        </header>

        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
};
