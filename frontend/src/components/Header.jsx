import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Bug, Shield, LayoutDashboard, FlaskConical, History, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/generate", label: "Generate", icon: FlaskConical },
  { path: "/history", label: "History", icon: History },
];

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="border-b border-surface-800 bg-surface-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Bug className="w-4 h-4 text-accent" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full animate-pulse-glow" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-none">Bug-Wise</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-surface-500 font-medium">QA Co-Pilot</p>
          </div>
        </Link>

        {/* Nav */}
        {isAuthenticated && (
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-surface-400 hover:text-surface-200 hover:bg-surface-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-surface-400">
                <Shield className="w-3 h-3 text-accent" />
                <span>{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs text-surface-500">
              <Shield className="w-3.5 h-3.5 text-accent" />
              Privacy-First
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
