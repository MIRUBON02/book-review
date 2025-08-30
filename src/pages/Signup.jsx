// Signup.jsx

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import Compressor from "compressorjs";
import styles from "./Login.module.css";
import { pickServerMessage } from "../lib/util";

// 画像以外は Zod で検証（ファイル入力は RHF 側の validate に任せます）
const schema = z.object({
  name: z.string().min(2, "ユーザー名は2文字以上で入力してください"),
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

// Compressor.js を Promise 化（ファイルが無ければ null）
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);

    new Compressor(file, {
      quality: 0.7, // 圧縮品質（0-1）
      maxWidth: 800, // 最大幅（超える場合だけリサイズ）
      maxHeight: 800, // 最大高さ
      convertSize: 500 * 1024, // 500KB 未満なら無変換で通す
      success(result) {
        // Blob → File に包み直す（ファイル名・type を維持）
        const compressed = new File([result], file.name, {
          type: result.type || file.type,
          lastModified: Date.now(),
        });
        resolve(compressed);
      },
      error(err) {
        reject(err);
      },
    });
  });
};

// JWT を付けて /uploads に FormData(icon) を送信
async function uploadIconWithJWT(file, token) {
  const fd = new FormData();
  // 仕様書のフィールド名: icon(必須)なので合わせる
  fd.append("icon", file);

  const res = await fetch(`${API_BASE}/uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Content-Type は付けない（ブラウザが boundary 付きで自動設定）
    },
    body: fd,
  });

  if (!res.ok) {
    throw new Error(await pickServerMessage(res));
  }
  return res.json(); // レスポンス（URLなど）を返す仕様ならここで受け取れる
}

export default function Signup() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onTouched",
  });

  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      // 画像は RHF 側で拾う（任意）
      const picked = values.avatar?.[0] ?? null;

      // 事前に簡単チェック（例：選択ファイルが10MB超なら弾く）
      if (picked && picked.size > 10 * 1024 * 1024) {
        setError("avatar", {
          type: "validate",
          message: "画像は10MBにしてください",
        });
        return;
      }

      // 画像を圧縮（なければ null が返る）
      const imageFile = await compressImage(picked);

      // ① /users でユーザー作成（レスポンスに token が返る想定）
      const userRes = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      if (!userRes.ok) {
        // 409 重複（メール or ユーザー）
        if (userRes.status === 409) {
          // 仕様上「メール重複」の可能性が高いので email にエラー表示
          setError("email", {
            type: "server",
            message: "このメールアドレスは既に登録されています",
          });
        }
        throw new Error(await pickServerMessage(userRes));
      }

      // ② レスポンスからトークン保存
      const created = await userRes.json();
      const token = created.token || created.accessToken;
      if (!token) throw new Error("認証トークンを取得できませんでした");
      localStorage.setItem("token", token);
      localStorage.setItem("userName", values.name);

      // ③ 画像があるならJWTでアップロード
      if (imageFile) {
        await uploadIconWithJWT(imageFile, token);
      }

      // ④ 一覧へ
      alert("ログインできました");
      navigate("/books");
    } catch (err) {
      setError("root", {
        type: "server",
        message: err?.message ?? "予期せぬエラーが発生しました",
      });
    }
  };

  // 画像プレビュー（任意）：選択されたら即時プレビューしたい場合
  const avatarFile = watch("avatar")?.[0];
  const previewUrl = avatarFile ? URL.createObjectURL(avatarFile) : null;

  return (
    <main className={styles.container}>
      <h1>新規登録</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={styles.form}
      >
        {/* ユーザー名 */}
        <label htmlFor="name">ユーザー名</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="ユーザー名"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="name-error" role="alert" className={styles.error}>
            {errors.name.message}
          </p>
        )}

        {/* メールアドレス */}
        <label htmlFor="email">メールアドレス</label>
        <input
          id="email"
          name="email"
          type="email"
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

        {/* パスワード */}
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

        {/* ユーザーアイコン（任意） */}
        <label htmlFor="avatar">ユーザーアイコン（任意）</label>
        <input
          id="avatar"
          type="file"
          accept="image/*"
          aria-invalid={!!errors.avatar}
          aria-describedby={errors.avatar ? "avatar-error" : undefined}
          {...register("avatar", {
            // 追加バリデーション例：拡張子/タイプチェック
            validate: (fileList) => {
              const f = fileList?.[0];
              if (!f) return true; // 選択なしはOK
              if (!f.type.startWith("image/"))
                return "画像ファイルを選択してください";
              return true;
            },
          })}
        />
        {errors.avatar && (
          <p id="avatar-error" role="alert" className={styles.error}>
            {errors.avatar.message}
          </p>
        )}

        {/* プレビュー（任意） */}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="選択したアイコンのプレビュー"
            className={styles.image}
          />
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "送信中..." : "登録"}
        </button>
      </form>

      <p className={styles.register}>
        すでにアカウントがありますか？ <Link to="/login">ログインはこちら</Link>
      </p>
    </main>
  );
}
