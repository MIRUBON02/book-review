import { useState, useMemo, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import { pickServerMessage } from "../lib/util";
import styles from "./NewReview.module.css";

export default function NewReview() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
  }, [navigate]);

  // 送信可否（URLは任意なので含めない）
  const canSubmit = useMemo(
    () => title.trim() && detail.trim() && !submitting,
    [title, detail, submitting]
  );

  // 送信処理
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!canSubmit) return;

      setSubmitting(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login", { replace: true, state: { from: "/new" } });
          return;
        }

        const body = {
          title: title.trim(),
          url: url.trim() || undefined, // 任意なので空は送らない
          detail: detail.trim(),
          review: detail.trim(),
        };

        const res = await fetch(`${API_BASE}/books`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            // 認証切れ：トークン破棄してログインへ
            localStorage.removeItem("token");
            localStorage.removeItem("userName");
            navigate("/login", { replace: true, state: { from: "/new" } });
            return;
          }
          // それ以外はサーバーのメッセージを優先
          throw new Error(await pickServerMessage(res));
        }

        alert("レビューを登録しました");
        navigate("/books", { replace: true });
      } catch (err) {
        setError(err.message || "登録に失敗しました");
      } finally {
        setSubmitting(false);
      }
    },
    [title, detail, url, canSubmit, navigate]
  );

  return (
    <main className={styles.container}>
      <div className={styles.backRow}>
        <Link to="/books" className={styles.linkButton} aria-label="一覧へ戻る">
          ← 一覧へ戻る
        </Link>
      </div>

      <header className={styles.header}>
        <h1>書籍レビューを投稿</h1>
      </header>

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <label>
          書籍タイトル{" "}
          <span className={styles.required} aria-hidden="true">
            *
          </span>
          <input
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label>
          参考URL（任意）
          <input
            type="url"
            className={styles.input}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            inputMode="url"
            autoComplete="url"
          />
        </label>

        <label>
          レビュー本文{" "}
          <span aria-hidden="true" className={styles.required}>
            *
          </span>
          <textarea
            rows={8}
            className={styles.textarea}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            required
          />
        </label>

        <div className={styles.buttonRow}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={!canSubmit}
          >
            {submitting ? "送信中..." : "レビューを登録する"}
          </button>
        </div>
      </form>
    </main>
  );
}
