import React from "react";
import { FlaskConical, FileCode2, Layers, Clock, ShieldAlert, Bug, Zap, Target } from "lucide-react";

function StatCard({ icon: Icon, label, value, color = "text-accent" }) {
  return (
    <div className="bg-surface-800/50 border border-surface-700 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg bg-surface-700/50 flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-surface-400">{label}</p>
      </div>
    </div>
  );
}

export default function StatsOverview({ stats }) {
  if (!stats) return null;

  const typeData = stats.typeCounts || {};
  const total = Object.values(typeData).reduce((a, b) => a + b, 0) || 1;

  const typeItems = [
    { label: "Positive", count: typeData.Positive || 0, color: "bg-green-500" },
    { label: "Negative", count: typeData.Negative || 0, color: "bg-red-500" },
    { label: "Edge Case", count: typeData["Edge Case"] || 0, color: "bg-purple-500" },
    { label: "Security", count: typeData.Security || 0, color: "bg-amber-500" },
    { label: "Boundary", count: typeData.Boundary || 0, color: "bg-pink-500" },
    { label: "Performance", count: typeData.Performance || 0, color: "bg-cyan-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Layers} label="Total Suites" value={stats.totalSuites || 0} color="text-accent" />
        <StatCard icon={FlaskConical} label="Test Cases" value={stats.totalTestCases || 0} color="text-purple-400" />
        <StatCard icon={FileCode2} label="Gherkin Scripts" value={stats.totalGherkin || 0} color="text-cyan-400" />
        <StatCard icon={Clock} label="Avg Time" value={stats.avgProcessingTime ? `${(stats.avgProcessingTime / 1000).toFixed(1)}s` : "—"} color="text-yellow-400" />
      </div>

      {/* Type distribution */}
      <div className="bg-surface-800/50 border border-surface-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-surface-200 mb-4">Test Case Type Distribution</h3>
        {total > 1 ? (
          <div className="space-y-3">
            {typeItems.filter((t) => t.count > 0).map((t) => {
              const pct = ((t.count / total) * 100).toFixed(0);
              return (
                <div key={t.label} className="flex items-center gap-3">
                  <span className="text-xs text-surface-400 w-20">{t.label}</span>
                  <div className="flex-1 h-2 bg-surface-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${t.color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-surface-400 w-12 text-right">{t.count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-surface-500">Generate your first suite to see distribution.</p>
        )}
      </div>
    </div>
  );
}
