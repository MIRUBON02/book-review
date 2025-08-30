// ReviewsListPrivate.jsx

import { useState, useEffect, useMemo } from "react";
import { API_BASE } from "../config";
import styles from "./ReviewsListPublic.module.css"; // 見た目そのまま使い回し
import { Link, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import {
  nextPrivate,
  prevPrivate,
} from "../features/pagination/paginationSlice";

import Paginator from "../components/Paginator";
import ReviewCard from "./ReviewCard";
import { pickServerMessage } from "../lib/util";
/**
 * 書籍レビュー一覧
 * API からレビューを取得し、先頭10件を表示します。
 * - API ベースURL: import.meta.env.VITE_API_BASE
 * - エンドポイント: "/reviews" を想定
 */
export default function ReviewsListPrivate() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const page = useSelector((s) => s.pagination.privatePage);
  const offset = useMemo(() => page * 10, [page]);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const res = await fetch(`${API_BASE}/books?offset=${offset}`, {
          signal: ac.signal,
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            // 認証切れ：トークン破棄してログインへ
            localStorage.removeItem("token");
            localStorage.removeItem("userName");
            navigate("/login", { replace: true });
            return;
          }
          // それ以外はサーバーのメッセージを優先
          throw new Error(await pickServerMessage(res));
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.books ?? [];
        setItems(list);
      } catch (e) {
        if (e.name !== "AbortError")
          setError(e.message || "取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [navigate, offset]);

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
  const canNext = items.length === 10;

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>書籍レビュー（ログイン限定）</h1>
        <p className={styles.subtitle}>10件ずつ表示</p>
        <div className={styles.toolbar}>
          <Link to="/new" className={styles.primaryButton}>
            + 新規レビュー
          </Link>
        </div>
      </header>

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
            onPrev={() => dispatch(prevPrivate())}
            onNext={() => dispatch(nextPrivate())}
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
