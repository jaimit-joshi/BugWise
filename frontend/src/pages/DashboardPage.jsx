import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useSuites } from "../hooks/useSuites.js";
import StatsOverview from "../components/StatsOverview.jsx";
import { Sparkles, Clock, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, loading, fetchStats } = useSuites();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-white">
          Welcome back, <span className="text-accent">{user?.name?.split(" ")[0] || "there"}</span>
        </h2>
        <p className="text-surface-400 text-sm mt-1">Here's your testing overview</p>
      </div>

      {/* Quick action */}
      <Link
        to="/generate"
        className="flex items-center justify-between p-4 mb-8 rounded-xl bg-accent/5 border border-accent/20 hover:border-accent/40 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Generate New Test Suite</p>
            <p className="text-xs text-surface-400">Paste code or a user story to get started</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-surface-400 group-hover:text-accent transition-colors" />
      </Link>

      {/* Stats */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl shimmer" />
          ))}
        </div>
      ) : (
        <StatsOverview stats={stats} />
      )}

      {/* Recent suites */}
      {stats?.recentSuites?.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-surface-200">Recent Generations</h3>
            <Link to="/history" className="text-xs text-accent hover:text-accent-light transition-colors">View all →</Link>
          </div>
          <div className="space-y-2">
            {stats.recentSuites.map((s) => (
              <Link
                key={s._id}
                to={`/history/${s._id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-800/30 border border-surface-700 hover:border-surface-600 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-200 font-medium truncate">{s.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-surface-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(s.createdAt).toLocaleDateString()}</span>
                    <span>{s.testCaseCount} cases</span>
                    <span>{s.gherkinCount} gherkin</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-surface-500" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
