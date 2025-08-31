// ReviewsListPublic.jsx

import { useEffect, useState, useMemo } from "react";
import { API_BASE } from "../config";
import { Link } from "react-router-dom";
import styles from "./ReviewCard.module.css";

import { useDispatch, useSelector } from "react-redux";
import { nextPublic, prevPublic } from "../features/pagination/paginationSlice";

import Paginator from "../components/Paginator";
import ReviewCard from "./ReviewCard";
import { pickServerMessage } from "../lib/util";
/**
 * 書籍レビュー一覧
 * API からレビューを取得し、先頭10件を表示します。
 * - API ベースURL: import.meta.env.VITE_API_BASE
 * - エンドポイント: "/reviews" を想定
 */

export default function ReviewsListPublic() {
  const dispatch = useDispatch();
  const page = useSelector((s) => s.pagination.publicPage);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const offset = useMemo(() => page * 10, [page]);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/public/books?offset=${offset}`, {
          signal: ac.signal,
          headers: { Accept: "application/json" }, // 認証不要
        });

        if (!res.ok) {
          // エラーボディに日本語メッセージがあれば拾う
          throw new Error(await pickServerMessage(res));
        }

        const data = await res.json(); // publicBookListGetResponse は配列
        const list = Array.isArray(data) ? data : data.books ?? [];
        setItems(list); // 先頭10件が返る仕様のため slice 不要
      } catch (e) {
        if (e.name !== "AbortError") {
          setError(e.message || "データの取得に失敗しました");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [offset]);

  if (loading) {
    return (
      <section className={styles.wrapper} aria-busy>
        <p className={styles.state}>読み込み中…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.wrapper} role="alert">
        <p className={styles.error}>エラー: {error}</p>
      </section>
    );
  }

  const canPrev = page > 0;
  const canNext = items.length === 10; // 10件未満なら「次へ」は無効

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>書籍レビュー（公開）</h1>
        <p className={styles.subtitle}>10件ずつ表示</p>
      </header>

      <p className={styles.register}>
        アカウントが無いですか？ <Link to="/signup">新規登録はこちら</Link>
      </p>
      <p className={styles.register}>
        すでにアカウントがありますか？ <Link to="/login">ログインはこちら</Link>
      </p>

      {items.length === 0 ? (
        <p className={styles.state}>レビューはまだありません。</p>
      ) : (
        <>
          <ul className={styles.list}>
            {items.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </ul>

          <Paginator
            page={page}
            onPrev={() => dispatch(prevPublic())}
            onNext={() => dispatch(nextPublic())}
            canPrev={canPrev}
            canNext={canNext}
            disabled={loading}
            className={styles.pager}
          />
        </>
      )}
    </section>
  );
}
