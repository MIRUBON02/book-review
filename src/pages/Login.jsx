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

      if (!res.ok) {
        throw new Error(await pickServerMessage(res));
      }

      const data = await res.json();

      const token = data.token ?? data.accessToken;
      if (!token) {
        // まれに 200 でもエラーメッセージが来るAPI用の保険
        const msg =
          data?.ErrorMessageJP ||
          data?.message ||
          "認証トークンを取得できませんでした";
        throw new Error(msg);
      }

      // 既存の残骸を一度クリア（予防）
      localStorage.removeItem("userName");
      localStorage.setItem("token", token);

      //  第一候補: ログインAPIのレスポンスに name があれば使う
      let name = data?.name;
      if (!name) {
        // 第二候補: /users で自分の情報を取得して名前を使う
        const meRes = await fetch(`${API_BASE}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (meRes.ok) {
          const me = await meRes.json();
          name = me?.name ?? me?.user?.name ?? "";
        }
      }
      if (!name) {
        // 第三候補: メールアドレスのローカル部を仮の名前に使う
        name = (values.email || "").split("@")[0] || "";
      }
      if (name) localStorage.setItem("userName", name);
      alert("ログインできました");
      navigate("/books");
    } catch (err) {
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
