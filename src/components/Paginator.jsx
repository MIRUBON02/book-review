// Paginator.jsx

import styles from "./Paginator.module.css";

export default function Paginator({
  page,
  onPrev,
  onNext,
  canPrev = true,
  canNext = true,
  disabled = false,
}) {
  return (
    <nav className={styles.pager} aria-label="ページネーション">
      <button
        type="button"
        className={styles.button}
        onClick={onPrev}
        disabled={disabled || !canPrev}
      >
        ← 前へ
      </button>
      {/* 表示必須ではないが軽く現在ページ（1始まり）を出す */}
      <span className={styles.indicator}>（{page + 1}）</span>
      <button
        type="button"
        className={styles.button}
        onClick={onNext}
        disabled={disabled || !canNext}
      >
        次へ →
      </button>
    </nav>
  );
}
