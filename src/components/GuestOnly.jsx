// src/components/GuestOnly.jsx
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function GuestOnly() {
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      alert("ログイン済です");
    }
  }, [token]);

  if (token) {
    // すでにログイン済み → 一覧へ
    return <Navigate to="/books" replace />;
  }
  return <Outlet />;
}
