import styles from "./ReviewCard.module.css";

export default function ReviewCard({ review: r }) {
  return (
    <li className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.bookTitle}>{r.title ?? "(無題)"}</h2>
      </div>

      <div className={styles.meta}>
        {r.reviewer && <span>レビュワー: {r.reviewer}</span>}
        {r.url && r.url.trim() ? (
          <span>
            {" / "}
            <a href={r.url.trim()} target="_blank" rel="noreferrer">
              参考URL
            </a>
          </span>
        ) : (
          <span className={styles.muted}> / 参考URLはありません</span>
        )}
      </div>

      {(r.detail && r.detail.trim()) || (r.review && r.review.trim()) ? (
        <>
          {r.detail && r.detail.trim() && (
            <p className={styles.detail}>
              <span>書籍情報：</span>
              {r.detail.trim().slice(0, 140)}
            </p>
          )}
          {r.review && r.review.trim() && (
            <p className={styles.review}>
              <span>レビュー：</span>
              {r.review.trim().slice(0, 140)}
            </p>
          )}
        </>
      ) : (
        <p className={styles.muted}>本文はありません</p>
      )}
    </li>
  );
}
