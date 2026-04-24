import React, { useState, useRef, useEffect } from "react";
import { ClipboardList, FlaskConical, FileCode2, Copy, Check, ChevronDown, ChevronRight, Tag, Clock, Target, ShieldAlert } from "lucide-react";

const TABS = [
  { id: "testPlan", label: "Test Plan", icon: ClipboardList },
  { id: "manualCases", label: "Manual Cases", icon: FlaskConical },
  { id: "gherkin", label: "Gherkin Scripts", icon: FileCode2 },
];

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} };
  return (
    <button onClick={copy} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function PriorityBadge({ priority }) {
  const c = { Critical: "bg-red-500/15 text-red-400 border-red-500/30", High: "bg-orange-500/15 text-orange-400 border-orange-500/30", Medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", Low: "bg-blue-500/15 text-blue-400 border-blue-500/30" };
  return <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${c[priority] || c.Medium}`}>{priority}</span>;
}

function TypeBadge({ type }) {
  const c = { Positive: "bg-green-500/15 text-green-400", Negative: "bg-red-500/15 text-red-400", "Edge Case": "bg-purple-500/15 text-purple-400", Security: "bg-amber-500/15 text-amber-400", Performance: "bg-cyan-500/15 text-cyan-400", Boundary: "bg-pink-500/15 text-pink-400" };
  return <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${c[type] || "bg-surface-700 text-surface-300"}`}>{type}</span>;
}

function TestPlanView({ testPlan }) {
  if (!testPlan) return <p className="text-surface-500 text-sm">No test plan data.</p>;
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold text-white">{testPlan.title || "Test Plan"}</h3>
        {testPlan.objective && <p className="text-sm text-surface-300 mt-1">{testPlan.objective}</p>}
      </div>
      {testPlan.testStrategy && (
        <div className="flex items-start gap-2">
          <Target className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-wider text-surface-400 font-semibold mb-1">Strategy</p>
            <p className="text-sm text-surface-200">{testPlan.testStrategy}</p>
          </div>
        </div>
      )}
      {testPlan.scope && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
            <p className="text-xs uppercase tracking-wider text-accent font-semibold mb-2">In Scope</p>
            <ul className="space-y-1">{(testPlan.scope.inScope || []).map((item, i) => <li key={i} className="text-sm text-surface-200 flex items-start gap-2"><span className="text-accent mt-1">•</span>{item}</li>)}</ul>
          </div>
          <div className="bg-surface-800/50 border border-surface-700 rounded-lg p-3">
            <p className="text-xs uppercase tracking-wider text-surface-400 font-semibold mb-2">Out of Scope</p>
            <ul className="space-y-1">{(testPlan.scope.outOfScope || []).map((item, i) => <li key={i} className="text-sm text-surface-400 flex items-start gap-2"><span className="mt-1">•</span>{item}</li>)}</ul>
          </div>
        </div>
      )}
      {testPlan.environmentRequirements?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-surface-400 font-semibold mb-2">Environment</p>
          <div className="flex flex-wrap gap-2">{testPlan.environmentRequirements.map((e, i) => <span key={i} className="text-xs bg-surface-800 text-surface-300 border border-surface-700 rounded-full px-3 py-1">{e}</span>)}</div>
        </div>
      )}
      {testPlan.riskAssessment?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3"><ShieldAlert className="w-4 h-4 text-warn" /><p className="text-xs uppercase tracking-wider text-surface-400 font-semibold">Risk Assessment</p></div>
          <div className="space-y-2">{testPlan.riskAssessment.map((r, i) => (
            <div key={i} className="bg-surface-800/50 border border-surface-700 rounded-lg p-3">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-surface-200 font-medium">{r.risk}</p>
                <div className="flex gap-2 flex-shrink-0"><span className="text-[10px] uppercase tracking-wider text-surface-400">L:{r.likelihood}</span><span className="text-[10px] uppercase tracking-wider text-surface-400">I:{r.impact}</span></div>
              </div>
              <p className="text-xs text-surface-400 mt-1">Mitigation: {r.mitigation}</p>
            </div>
          ))}</div>
        </div>
      )}
      {testPlan.estimatedEffort && <div className="flex items-center gap-2 text-sm text-surface-400"><Clock className="w-4 h-4" /><span>Estimated Effort: {testPlan.estimatedEffort}</span></div>}
    </div>
  );
}

function ManualCasesView({ cases }) {
  const [expandedId, setExpandedId] = useState(null);
  if (!cases?.length) return <p className="text-surface-500 text-sm">No test cases generated.</p>;
  return (
    <div className="space-y-3 animate-fade-in">
      <p className="text-xs text-surface-500 mb-4">{cases.length} test case{cases.length !== 1 && "s"} generated</p>
      {cases.map((tc) => {
        const open = expandedId === tc.id;
        return (
          <div key={tc.id} className="border border-surface-700 rounded-lg overflow-hidden bg-surface-800/30 hover:border-surface-600 transition-colors">
            <button onClick={() => setExpandedId(open ? null : tc.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
              {open ? <ChevronDown className="w-4 h-4 text-surface-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-surface-400 flex-shrink-0" />}
              <span className="text-xs font-mono text-surface-500 w-16 flex-shrink-0">{tc.id}</span>
              <span className="text-sm text-surface-200 font-medium flex-1 truncate">{tc.title}</span>
              <div className="flex items-center gap-2 flex-shrink-0"><TypeBadge type={tc.type} /><PriorityBadge priority={tc.priority} /></div>
            </button>
            {open && (
              <div className="px-4 pb-4 pt-1 border-t border-surface-700 space-y-4 animate-fade-in">
                {tc.preconditions?.length > 0 && (<div><p className="text-xs uppercase tracking-wider text-surface-500 font-semibold mb-1">Preconditions</p><ul className="space-y-1">{tc.preconditions.map((p, i) => <li key={i} className="text-sm text-surface-300 flex items-start gap-2"><span className="text-surface-500 mt-0.5">{i+1}.</span>{p}</li>)}</ul></div>)}
                {tc.steps?.length > 0 && (
                  <div><p className="text-xs uppercase tracking-wider text-surface-500 font-semibold mb-2">Steps</p>
                    <div className="bg-surface-900 rounded-lg overflow-hidden border border-surface-700">
                      <table className="w-full text-sm"><thead><tr className="border-b border-surface-700"><th className="px-3 py-2 text-left text-xs text-surface-500 font-semibold w-10">#</th><th className="px-3 py-2 text-left text-xs text-surface-500 font-semibold">Action</th><th className="px-3 py-2 text-left text-xs text-surface-500 font-semibold">Expected Result</th></tr></thead>
                      <tbody>{tc.steps.map((s, i) => <tr key={i} className="border-b border-surface-800 last:border-0"><td className="px-3 py-2 text-surface-500 font-mono text-xs">{s.step}</td><td className="px-3 py-2 text-surface-200">{s.action}</td><td className="px-3 py-2 text-surface-300">{s.expectedResult}</td></tr>)}</tbody></table>
                    </div>
                  </div>
                )}
                {tc.testData && (<div><p className="text-xs uppercase tracking-wider text-surface-500 font-semibold mb-1">Test Data</p><p className="text-sm text-surface-300 font-mono bg-surface-900 rounded-md px-3 py-2 border border-surface-700">{tc.testData}</p></div>)}
                {tc.postconditions && (<div><p className="text-xs uppercase tracking-wider text-surface-500 font-semibold mb-1">Postconditions</p><p className="text-sm text-surface-400">{tc.postconditions}</p></div>)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function highlightGherkin(text) {
  if (!text) return null;
  const kw = /^(Feature:|Scenario:|Scenario Outline:|Background:|Given|When|Then|And|But|Examples:|\|)/gm;
  return text.split("\n").map((line, i) => <div key={i} dangerouslySetInnerHTML={{ __html: line.replace(kw, (m) => `<span class="keyword">${m}</span>`) }} />);
}

function GherkinView({ scripts }) {
  if (!scripts?.length) return <p className="text-surface-500 text-sm">No Gherkin scripts generated.</p>;
  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-xs text-surface-500 mb-4">{scripts.length} scenario{scripts.length !== 1 && "s"}</p>
      {scripts.map((s, idx) => (
        <div key={idx} className="border border-surface-700 rounded-lg overflow-hidden bg-surface-800/30">
          <div className="flex items-center justify-between px-4 py-2 border-b border-surface-700 bg-surface-800/50">
            <div className="flex items-center gap-2"><FileCode2 className="w-4 h-4 text-accent" /><span className="text-sm font-medium text-surface-200">{s.feature || `Scenario ${idx+1}`}</span></div>
            <div className="flex items-center gap-2">
              {s.tags?.map((t, i) => <span key={i} className="flex items-center gap-1 text-[10px] font-mono bg-accent/10 text-accent rounded px-1.5 py-0.5"><Tag className="w-2.5 h-2.5" />{t}</span>)}
              <CopyBtn text={s.gherkin} />
            </div>
          </div>
          <div className="gherkin-block m-0 rounded-none border-0">{highlightGherkin(s.gherkin)}</div>
        </div>
      ))}
    </div>
  );
}

export default function ResultsPanel({ data, meta }) {
  const [activeTab, setActiveTab] = useState("testPlan");
  const tabsRef = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({});

  useEffect(() => {
    const el = tabsRef.current[activeTab];
    if (el) setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeTab]);

  if (!data) return null;
  const { testPlan, manualTestCases, gherkinScripts, metadata } = data;

  return (
    <div className="animate-slide-up">
      {metadata?.coverageSummary && (
        <div className="flex flex-wrap items-center gap-3 mb-6 p-3 rounded-lg bg-surface-800/50 border border-surface-700">
          <span className="text-xs text-surface-400 font-semibold uppercase tracking-wider">Coverage:</span>
          {Object.entries(metadata.coverageSummary).filter(([k]) => k !== "totalTestCases").map(([k, v]) => <span key={k} className="text-xs bg-surface-700/50 rounded-full px-2.5 py-0.5 text-surface-300">{k}: {v}</span>)}
          {meta?.processingTimeMs && <span className="ml-auto text-xs text-surface-500 flex items-center gap-1"><Clock className="w-3 h-3" />{(meta.processingTimeMs / 1000).toFixed(1)}s</span>}
        </div>
      )}

      <div className="relative border-b border-surface-700 mb-6">
        <div className="flex gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} ref={(el) => (tabsRef.current[id] = el)} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === id ? "text-accent" : "text-surface-400 hover:text-surface-200"}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>
        <div className="absolute bottom-0 h-0.5 bg-accent rounded-full tab-indicator" style={indicatorStyle} />
      </div>

      {activeTab === "testPlan" && <TestPlanView testPlan={testPlan} />}
      {activeTab === "manualCases" && <ManualCasesView cases={manualTestCases} />}
      {activeTab === "gherkin" && <GherkinView scripts={gherkinScripts} />}
    </div>
  );
}
