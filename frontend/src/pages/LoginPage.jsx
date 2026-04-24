import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { Bug, LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.error || "Login failed.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center">
            <Bug className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Bug-Wise</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-surface-500">QA Co-Pilot</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-sm text-surface-400 mb-6">Sign in to your account</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-sm text-danger-light">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-surface-100 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-surface-100 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-accent text-surface-950 hover:bg-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-surface-500 mt-5">
            Don't have an account?{" "}
            <Link to="/signup" className="text-accent hover:text-accent-light transition-colors">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
