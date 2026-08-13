import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import {
  Bootstrapper,
  ProtectedRoute,
  PublicOnlyRoute,
  SoftAuthRoute,
} from "@/components/auth/RouteGuards";
import { ExplorePage } from "@/pages/ExplorePage";
import { FeedPage } from "@/pages/FeedPage";
import { LoginPage } from "@/pages/LoginPage";
import { PostDetailPage } from "@/pages/PostDetailPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { SettingsPage } from "@/pages/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Bootstrapper>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ExplorePage />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/explore" element={<Navigate to="/" replace />} />
            <Route path="/following" element={<FeedPage />} />
            <Route path="/feed" element={<Navigate to="/following" replace />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route element={<SoftAuthRoute />}>
            <Route path="/users/:id" element={<ProfilePage />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Bootstrapper>
    </BrowserRouter>
  );
}
