import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { API_BASE } from "../config";
import styles from "./Login.module.css";

const schema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

export default function Login() {
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
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        credentials: "include", //cookie認証なら
      });

      if (!res.ok) {
        let msg = "ログインに失敗しました";
        try {
          const data = await res.json();
          // サーバがフィールド別エラーを返す場合はここで反映
          if (data?.fieldErrors) {
            Object.entries(data.fieldErrors).forEach(([field, message]) => {
              setError(field, { type: "server", message: String(message) });
            });
          }
          if (data?.message) msg = data.message;
        } catch {
          //ignore parse error
        }
        throw new Error(msg);
      }

      alert("ログインできました");
      // 必要ならここで画面遷移：navigate('/') など
    } catch (err) {
      // 画面上部に出す共通エラー
      setError("root", {
        type: "server",
        message: err.message ?? "予期せぬエラーが発生しました",
      });
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
