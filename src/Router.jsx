// Router.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ReviewsListPublic from "./pages/ReviewsListPublic";
import ReviewsListPrivate from "./pages/ReviewsListPrivate";
import RequireAuth from "./components/RequireAuth";
import GuestOnly from "./components/GuestOnly";
import Profile from "./pages/Profile";
import NewReview from "./pages/NewReview";
import ReviewDetail from "./pages/ReviewDetail";
import EditReview from "./pages/EditReview";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/public/books" replace />} />

      {/* ★ レビュー詳細ページ：誰でも見られるのでトップ階層に配置 */}
      <Route path="/detail/:id" element={<ReviewDetail />} />

      {/* 公開ページ */}
      <Route path="/public/books" element={<ReviewsListPublic />} />

      {/* 未ログインユーザー限定 */}
      <Route element={<GuestOnly />}>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* ここから下はログイン必須 */}
      <Route element={<RequireAuth />}>
        <Route path="/books" element={<ReviewsListPrivate />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/new" element={<NewReview />} />
        <Route path="/edit/:id" element={<EditReview />} />
      </Route>

      <Route path="*" element={<Navigate to="/public/books" replace />} />
    </Routes>
  );
}
