import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.js";
import Header from "./components/Header.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import GeneratorPage from "./pages/GeneratorPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import DiffPage from "./pages/DiffPage.jsx";

// Protected route wrapper
function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-4 border-t border-surface-800 text-center">
        <p className="text-xs text-surface-600">Bug-Wise v1.0 — Your code is never stored unencrypted.</p>
      </footer>
    </div>
  );
}

// Public route — redirect to dashboard if already logged in
function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/generate" element={<GeneratorPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:id" element={<HistoryPage />} />
        <Route path="/diff/:id1/:id2" element={<DiffPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
