import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { Bug, UserPlus } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const result = await signup(name, email, password);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.error || "Signup failed.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center">
            <Bug className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Bug-Wise</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-surface-500">QA Co-Pilot</p>
          </div>
        </div>

        <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Create account</h2>
          <p className="text-sm text-surface-400 mb-6">Start generating test artifacts</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-sm text-danger-light">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-surface-100 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="Your name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-surface-100 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="you@gmail.com" />
              <p className="text-[10px] text-surface-500 mt-1">Accepted: Gmail, Northeastern, Yahoo, Outlook, iCloud, ProtonMail</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-surface-100 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="Min 8 chars, 1 upper, 1 number, 1 special" />
              <p className="text-[10px] text-surface-500 mt-1">Must include: 1 uppercase, 1 number, 1 special character (!@#$%...)</p>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-accent text-surface-950 hover:bg-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <UserPlus className="w-4 h-4" />
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-surface-500 mt-5">
            Already have an account? <Link to="/login" className="text-accent hover:text-accent-light transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
