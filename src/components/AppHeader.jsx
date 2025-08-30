// src/components/AppHeader.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./AppHeader.module.css";

export default function AppHeader() {
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName") || "ログイン中";
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/public/books", { replace: true, state: { from: location } });
  };

  return (
    <header className={styles.header}>
      <Link to="/public/books" className={styles.logo}>
        Station6 書籍レビュー
      </Link>

      <nav className={styles.nav}>
        {token ? (
          <>
            <span className={styles.user}>ようこそ、{userName} さん</span>
            <Link to="/profile" className={styles.button}>
              プロフィール編集
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className={styles.button}
            >
              ログアウト
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.button}>
              ログイン
            </Link>
            <Link to="/signup" className={styles.link}>
              新規登録
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
