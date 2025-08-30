// Login.jsx

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import styles from "./Login.module.css";
import { pickServerMessage } from "../lib/util";

const schema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

export default function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    try {
      const res = await fetch(`${API_BASE}/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(values),
      });

      // 失敗時はサーバーメッセージを優先表示
      if (!res.ok) {
        throw new Error(await pickServerMessage(res));
      }

      // 成功時のみJSONを読む（※ res.json() は1回きり）
      const data = await res.json();

      // ★ ここでトークンを取り出す
      const token = data.token ?? data.accessToken;
      if (!token) {
        // まれに 200 でもエラーメッセージが来るAPI用の保険
        const msg =
          data?.ErrorMessageJP ||
          data?.message ||
          "認証トークンを取得できませんでした";
        throw new Error(msg);
      }

      localStorage.setItem("token", token);
      // もしサーバーが name を返すなら保存してヘッダー表示に反映
      if (data?.name) localStorage.setItem("userName", data.name);

      alert("ログインできました");

      // ここでログイン後のレビューにいけるようにする
      navigate("/books");
    } catch (err) {
      // 画面上部に出す共通エラー
      setError("root", { type: "server", message: err.message });
    }
  };

  return (
    <main className={styles.container}>
      <h1>ログイン</h1>

      {/* グローバルエラー */}
      {errors.root?.message && (
        <p role="alert" className={styles.error}>
          {errors.root.message}
        </p>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={styles.form}
      >
        <label htmlFor="email">メールアドレス</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          disabled={isSubmitting}
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" role="alert" className={styles.error}>
            {errors.email.message}
          </p>
        )}

        <label htmlFor="password">パスワード</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="パスワードは8文字以上"
          minLength={8}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          disabled={isSubmitting}
          {...register("password")}
        />
        {errors.password && (
          <p id="password-error" role="alert" className={styles.error}>
            {errors.password.message}
          </p>
        )}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "送信中..." : "ログイン"}
        </button>
      </form>

      <p className={styles.register}>
        アカウントが無いですか？ <Link to="/signup">新規登録はこちら</Link>
      </p>
    </main>
  );
}
