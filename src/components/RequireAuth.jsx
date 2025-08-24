// RequireAuth.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function RequireAuth() {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    // 直リンク時などは元のURLを覚えてログイン後に戻す
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
