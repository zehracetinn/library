// src/components/ProtectedRoute.tsx
import React from "react";

import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}



export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    // Kullanıcı login değil → login sayfasına at
    // state.from ile "nereden geldiğini" saklıyoruz
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}   // burası önemli!
      />
    );
  }

  // Token varsa → sayfayı göster
  return children;
}
