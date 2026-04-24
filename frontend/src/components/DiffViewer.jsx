import React from "react";
import { Plus, Minus, Equal, ArrowRight, GitCompare } from "lucide-react";

function DiffStat({ label, before, after }) {
  const delta = after - before;
  const isUp = delta > 0;
  const isDown = delta < 0;
  return (
    <div className="bg-surface-800/50 border border-surface-700 rounded-lg p-3 text-center">
      <p className="text-xs text-surface-400 mb-1">{label}</p>
      <div className="flex items-center justify-center gap-2">
        <span className="text-lg font-bold text-surface-300">{before}</span>
        <ArrowRight className="w-3.5 h-3.5 text-surface-500" />
        <span className={`text-lg font-bold ${isUp ? "text-accent" : isDown ? "text-danger" : "text-surface-300"}`}>{after}</span>
      </div>
      {delta !== 0 && (
        <span className={`text-[10px] font-semibold ${isUp ? "text-accent" : "text-danger"}`}>
          {isUp ? "+" : ""}{delta}
        </span>
      )}
    </div>
  );
}

function CaseList({ title, cases, color, icon: Icon }) {
  if (!cases?.length) return null;
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className={`text-xs font-semibold uppercase tracking-wider ${color}`}>{title} ({cases.length})</span>
      </div>
      <div className="space-y-1.5">
        {cases.map((tc, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800/50 border border-surface-700">
            <span className="text-xs font-mono text-surface-500">{tc.id}</span>
            <span className="text-sm text-surface-200">{tc.title}</span>
            <span className="ml-auto text-[10px] uppercase text-surface-500">{tc.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DiffViewer({ diff }) {
  if (!diff) return null;

  const { suite1, suite2, diff: d } = diff;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <GitCompare className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-bold text-white">Suite Comparison</h3>
      </div>

      {/* Suite labels */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-800/50 border border-surface-700 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-1">Suite A (Before)</p>
          <p className="text-sm font-medium text-surface-200 truncate">{suite1.title}</p>
          <p className="text-[10px] text-surface-500 mt-0.5">{new Date(suite1.createdAt).toLocaleString()}</p>
        </div>
        <div className="bg-surface-800/50 border border-accent/20 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-accent mb-1">Suite B (After)</p>
          <p className="text-sm font-medium text-surface-200 truncate">{suite2.title}</p>
          <p className="text-[10px] text-surface-500 mt-0.5">{new Date(suite2.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <DiffStat label="Test Cases" before={d.testCases.totalBefore} after={d.testCases.totalAfter} />
        <DiffStat label="Gherkin Scripts" before={d.gherkinScripts.totalBefore} after={d.gherkinScripts.totalAfter} />
        <DiffStat label="Risk Items" before={d.riskAssessment.before} after={d.riskAssessment.after} />
      </div>

      {/* Common count */}
      {d.testCases.common > 0 && (
        <div className="flex items-center gap-2 text-xs text-surface-400">
          <Equal className="w-3.5 h-3.5" />
          <span>{d.testCases.common} test case{d.testCases.common !== 1 && "s"} unchanged</span>
        </div>
      )}

      {/* Added test cases */}
      <CaseList title="Added Test Cases" cases={d.testCases.added} color="text-accent" icon={Plus} />

      {/* Removed test cases */}
      <CaseList title="Removed Test Cases" cases={d.testCases.removed} color="text-danger" icon={Minus} />

      {/* Added Gherkin */}
      {d.gherkinScripts.added?.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">Added Gherkin ({d.gherkinScripts.added.length})</span>
          </div>
          {d.gherkinScripts.added.map((g, i) => (
            <div key={i} className="px-3 py-2 rounded-lg bg-surface-800/50 border border-surface-700 mb-1.5">
              <span className="text-sm text-surface-200">{g.feature || g.scenario}</span>
            </div>
          ))}
        </div>
      )}

      {/* Removed Gherkin */}
      {d.gherkinScripts.removed?.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Minus className="w-4 h-4 text-danger" />
            <span className="text-xs font-semibold uppercase tracking-wider text-danger">Removed Gherkin ({d.gherkinScripts.removed.length})</span>
          </div>
          {d.gherkinScripts.removed.map((g, i) => (
            <div key={i} className="px-3 py-2 rounded-lg bg-surface-800/50 border border-surface-700 mb-1.5">
              <span className="text-sm text-surface-300 line-through">{g.feature || g.scenario}</span>
            </div>
          ))}
        </div>
      )}

      {d.testCases.added.length === 0 && d.testCases.removed.length === 0 &&
       d.gherkinScripts.added.length === 0 && d.gherkinScripts.removed.length === 0 && (
        <p className="text-sm text-surface-500 text-center py-6">No differences found between the two suites.</p>
      )}
    </div>
  );
}
