import { useRef, useState } from "react";
import styles from "./Login.module.css";

export default function Login() {
  const formRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const updateErrors = () => {
    const emailEl = emailRef.current;
    const passEl = passwordRef.current;
    setErrors({
      email:
        emailEl && !emailEl.validity.valid ? emailEl.validationMessage : "",
      password:
        passEl && !passEl.validity.valid ? passEl.validationMessage : "",
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form.checkValidity()) {
      updateErrors();
      return;
    }
    setErrors({ email: "", password: "" });
    alert("OK: フォームは有効です");
  };

  return (
    <main className={styles.container}>
      <h1>ログイン</h1>
      <form ref={formRef} onSubmit={onSubmit} noValidate>
        <label htmlFor="email">メールアドレス</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          ref={emailRef}
          onInput={updateErrors}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" role="alert">
            {errors.email}
          </p>
        )}
        <label htmlFor="password">パスワード</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          ref={passwordRef}
          onInput={updateErrors}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && (
          <p id="password-error" role="alert">
            {errors.password}
          </p>
        )}
        <button type="submit">ログイン</button>
      </form>
    </main>
  );
}
