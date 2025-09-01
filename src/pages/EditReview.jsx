// src/pages/EditReview.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { API_BASE } from "../config";
import { pickServerMessage } from "../lib/util";
import styles from "./NewReview.module.css"; // 既存のフォームスタイルを流用

export default function EditReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || "/books";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // フォーム値
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [review, setReview] = useState("");
  const [url, setUrl] = useState("");

  // 初期データ（認証必須）
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("編集はログインしたユーザーのみ可能です");
          navigate("/login", { replace: true, state: { from: `/edit/${id}` } });
          return;
        }

        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/books/${id}`, {
          signal: ac.signal,
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(await pickServerMessage(res));

        const data = await res.json();
        // 既存データをフォームに適用
        setTitle((data?.title ?? "").trim());
        setDetail((data?.detail ?? "").trim());
        setReview((data?.review ?? "").trim());
        setUrl((data?.url ?? "").trim());
      } catch (e) {
        if (e.name !== "AbortError")
          setError(e.message || "取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
    // id: idが変わるたびに useEffect が再実行するため[]に記述
  }, [id, navigate]);

  const canSubmit = useMemo(() => {
    const hasbody =
      title.trim().length > 0 &&
      detail.trim().length > 0 &&
      review.trim().length > 0 &&
      url.trim().length > 0 &&
      !saving;
    return hasbody;
  }, [title, detail, review, url, saving]);

  // 更新
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        alert("編集はログインしたユーザーのみ可能です2");
        navigate("/login", { replace: true, state: { from: `/edit/${id}` } });
        return;
      }

      const t = title.trim();
      const d = detail.trim();
      const r = review.trim();
      const u = url.trim();
      const normalizedUrl =
        u && /^https?:\/\//i.test(u) ? u : u ? `https://${u}` : "";

      const payload = {
        title: t.slice(0, 140),
        detail: d.slice(0, 140),
        review: r.slice(0, 140),
        url: normalizedUrl,
      };

      const res = await fetch(`${API_BASE}/books/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(await pickServerMessage(res));
      }

      alert("レビューを更新しました");
      navigate(`/books`, { replace: true });
    } catch (e) {
      setError(e.message || "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  // 削除
  const handleDelete = async () => {
    if (!confirm("このレビューを削除します。よろしいですか？")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("削除はログインしたユーザーのみ可能です");
        navigate("/login", { replace: true, state: { from: `/edit/${id}` } });
        return;
      }

      const res = await fetch(`${API_BASE}/books/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error(await pickServerMessage(res));

      alert("レビューを削除しました");
      navigate("/books", { replace: true });
    } catch (e) {
      setError(e.message || "削除に失敗しました");
    }
  };

  if (loading) {
    return (
      <main className={styles.container}>
        <p>読み込み中…</p>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.backRow}>
        <Link
          to={returnTo}
          className={styles.linkButton}
          aria-label="レビュー一覧（ログイン限定）へ戻る"
        >
          ← レビュー一覧（ログイン限定）へ戻る
        </Link>
      </div>

      <header className={styles.header}>
        <h1>レビューを編集</h1>
      </header>

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      <form onSubmit={handleUpdate} className={styles.form} noValidate>
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
          参考URL
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
          書籍情報
          <textarea
            rows={8}
            className={styles.textarea}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
          />
        </label>

        <label htmlFor="review">レビュー本文</label>
        <textarea
          id="review"
          rows={8}
          className={styles.textarea}
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={!canSubmit}
          >
            {saving ? "保存中…" : "更新する"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className={styles.linkButton}
            aria-label="このレビューを削除する"
          >
            削除する
          </button>
        </div>
      </form>
    </main>
  );
}
