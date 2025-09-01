// ReviewDetail.jsx

import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import { pickServerMessage } from "../lib/util";
import styles from "./ReviewDetail.module.css";

export default function ReviewDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  //    まずプレビュー（仮表示）を出して、APIからの本物データが来たら差し替える
  // dataがなければpreviwを、それもなければnullを返す
  const preview = location.state?.preview ?? null;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const view = useMemo(() => data ?? preview ?? null, [data, preview]);

  useEffect(() => {
    const ac = new AbortController();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("詳細はログインしたユーザーのみ閲覧できます");
      navigate("/login", { replace: true, state: { from: location } });
      return () => ac.abort();
    }

    (async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        // ログイン有無でエンドポイントを出し分け（401/403なら公開側にフォールバック）
        const tryFetch = async (url, headers = {}) => {
          const res = await fetch(url, {
            signal: ac.signal,
            headers: { Accept: "application/json", ...headers },
          });
          if (!res.ok) throw new Error(await pickServerMessage(res));
          return res.json();
        };

        // まずはログイン状況に応じた詳細APIへ
        let json;
        if (token) {
          try {
            json = await tryFetch(`${API_BASE}/books/${id}`, {
              Authorization: `Bearer ${token}`,
            });
          } catch {
            // 認証切れや非公開API未対応などは公開APIで再試行
            json = await tryFetch(`${API_BASE}/public/books/${id}`);
          }
        } else {
          json = await tryFetch(`${API_BASE}/public/books/${id}`);
        }

        setData(json);
      } catch (e) {
        if (e.name !== "AbortError")
          setError(e.message || "データ取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [id]);

  return (
    <main className={styles.container}>
      <div className={styles.backRow}>
        <Link to="/books" className={styles.linkButton} aria-label="一覧へ戻る">
          ← 一覧へ戻る
        </Link>
      </div>

      <header className={styles.header}>
        <h1>書籍レビュー 詳細</h1>
      </header>

      {loading && (
        <div role="status" aria-live="polite" className={styles.loading}>
          読み込み中です…
        </div>
      )}

      {error && !loading && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      {!loading && !error && view && (
        <article className={styles.article}>
          <h2 className={styles.title}>{view.title ?? "(無題)"}</h2>

          <div className={styles.meta}>
            {view.reviewer ? (
              <>レビュワー: {view.reviewer}</>
            ) : (
              <span className={styles.muted}>レビュワー不明</span>
            )}
            {" / "}
            {view.url && String(view.url).trim() ? (
              <a
                href={String(view.url).trim()}
                target="_blank"
                rel="noreferrer"
              >
                参考URL
              </a>
            ) : (
              <span className={styles.muted}>参考URLはありません</span>
            )}
          </div>

          {/* 自分のレビューだけ編集リンク（isMine を使う） */}
          {view.isMine && (
            <div style={{ margin: "8px 0 16px" }}>
              <Link
                to={`/edit/${view.id}`}
                className={styles.linkButton}
                // ← レビュー詳細に戻したい
                state={{ returnTo: `/detail/${view.id}` }}
              >
                編集
              </Link>
            </div>
          )}

          {(() => {
            const bookInfo = String(view.detail ?? "").trim();
            const reviewText = String(view.review ?? "").trim();
            return (
              <>
                <p className={styles.row}>
                  <span className={styles.label}>書籍情報：</span>
                  <span className={styles.value}>
                    {bookInfo || "（未入力）"}
                  </span>
                </p>
                <p className={styles.row}>
                  <span className={styles.label}>レビュー：</span>
                  <span className={styles.value}>
                    {reviewText || "（未入力）"}
                  </span>
                </p>
              </>
            );
          })()}
        </article>
      )}
    </main>
  );
}
