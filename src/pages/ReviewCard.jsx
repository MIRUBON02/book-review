import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./ReviewCard.module.css";

export default function ReviewCard({ review: r }) {
  const navigate = useNavigate();
  const location = useLocation();
  const id = r?.id ?? r?.reviewId;

  const handleCardClick = () => {
    if (id == null) return;
    navigate(`/detail/${id}`, { state: { preview: r } });
  };

  return (
    <li className={styles.card} onClick={handleCardClick}>
      <div className={styles.cardHeader}>
        <h2 className={styles.bookTitle}>{r.title ?? "(無題)"}</h2>

        {/* /books の一覧アイテムには isMine が返るので、自分の投稿だけ編集表示 */}
        {r.isMine && id != null && (
          <Link
            to={`/edit/${id}`}
            // これで「ログイン一覧（/books）」から来た事実が state.returnTo === "/books" に残る
            state={{ returnTo: location.pathname }}
            className={styles.editLink}
            aria-label="このレビューを編集"
            onClick={(e) => e.stopPropagation()} // カード遷移の抑止
          >
            編集
          </Link>
        )}
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
