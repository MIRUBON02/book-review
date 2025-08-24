// Router.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ReviewsListPublic from "./pages/ReviewsListPublic";
import ReviewsListPrivate from "./pages/ReviewsListPrivate";
import RequireAuth from "./components/RequireAuth";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/public/books" replace />} />

      {/* 公開ページ */}
      <Route path="/public/books" element={<ReviewsListPublic />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* ここから下はログイン必須 */}
      <Route element={<RequireAuth />}>
        <Route path="/books" element={<ReviewsListPrivate />} />
      </Route>

      <Route path="*" element={<Navigate to="/public/books" replace />} />
    </Routes>
  );
}
