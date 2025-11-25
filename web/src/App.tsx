import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import ContentDetail from "./pages/ContentDetail";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/content/:id"
          element={
            <ProtectedRoute>
              <ContentDetail />
            </ProtectedRoute>
          }
        />

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}
