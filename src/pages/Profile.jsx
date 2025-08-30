// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import styles from "./Login.module.css";
import { pickServerMessage } from "../lib/util";

const schema = z.object({
  name: z.string().min(2, "ユーザー名は2文字以上で入力してください"),
});

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  // 初期表示：ユーザー情報を取得してフォームに反映
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const res = await fetch(`${API_BASE}/users`, {
          signal: ac.signal,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("userName");
            navigate("/login", { replace: true });
            return;
          }
          throw new Error(await pickServerMessage(res));
        }

        const data = await res.json();
        // 取得値でフォームを上書き（null/undefined保険で "" を入れる）
        reset({ name: data?.name ?? "" });
      } catch (e) {
        if (e.name !== "AbortError") {
          setError("root", {
            type: "server",
            message: e.message || "ユーザー情報の取得に失敗しました",
          });
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [navigate, reset, setError]);

  // 送信：ユーザー情報更新
  const onSubmit = async (values) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const res = await fetch(`${API_BASE}/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("userName");
          navigate("/login", { replace: true });
          return;
        }
        throw new Error(await pickServerMessage(res));
      }

      // 更新成功：ヘッダー用の名前を更新して戻る
      if (values.name) {
        localStorage.setItem("userName", values.name);
        alert("プロフィールを更新しました");
        navigate("/books");
      }
    } catch (err) {
      setError("root", {
        type: "server",
        message: err.message ?? "更新に失敗しました",
      });
    }
  };

  if (loading) return <p className={styles.container}>読み込み中...</p>;

  return (
    <main className={styles.container}>
      <div className={styles.backRow}>
        <Link
          to="/books"
          className={styles.linkButton}
          aria-label="書籍レビューへ戻る"
        >
          ← 書籍レビューへ戻る
        </Link>
      </div>
      <header className={styles.header}>
        <h1>プロフィール編集</h1>
        <p>ユーザー名のみ編集することができます。</p>
        {errors.root?.message && (
          <p role="alert" className={styles.error}>
            {errors.root.message}
          </p>
        )}
      </header>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={styles.form}
      >
        <label htmlFor="name">ユーザー名</label>
        <input id="name" {...register("name")} aria-invalid={!!errors.name} />
        {errors.name && <p className={styles.error}>{errors.name.message}</p>}

        <button
          type="submit"
          className={styles.updateButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "送信中..." : "更新"}
        </button>
      </form>
    </main>
  );
}
