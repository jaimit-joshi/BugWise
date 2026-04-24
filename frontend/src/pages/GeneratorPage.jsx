import React, { useState } from "react";
import { Link } from "react-router-dom";
import PrivacyToggle from "../components/PrivacyToggle.jsx";
import CodeInput from "../components/CodeInput.jsx";
import LoadingState from "../components/LoadingState.jsx";
import ErrorDisplay from "../components/ErrorDisplay.jsx";
import ResultsPanel from "../components/ResultsPanel.jsx";
import PrivacyBanner from "../components/PrivacyBanner.jsx";
import ExportMenu from "../components/ExportMenu.jsx";
import { useGenerateTests } from "../hooks/useGenerateTests.js";
import { Shield, Zap, FlaskConical, ExternalLink } from "lucide-react";

export default function GeneratorPage() {
  const [code, setCode] = useState("");
  const [inputType, setInputType] = useState("code");
  const [privacyEnabled, setPrivacyEnabled] = useState(true);
  const { data, loading, error, meta, privacyInfo, suiteId, generate, reset } = useGenerateTests();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      {!data && !loading && (
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Generate Test Artifacts <span className="text-accent">Instantly</span>
          </h2>
          <p className="text-surface-400 text-sm max-w-2xl">
            Paste your code or user story below. Bug-Wise will analyze it and generate a comprehensive Test Plan, Manual Test Cases, and Gherkin scripts.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            {[
              { icon: Shield, label: "PII Auto-Redaction", color: "text-accent" },
              { icon: Zap, label: "AI-Powered", color: "text-yellow-400" },
              { icon: FlaskConical, label: "Edge Case Emphasis", color: "text-purple-400" },
            ].map(({ icon: Icon, label, color }) => (
              <span key={label} className="flex items-center gap-2 text-xs bg-surface-800/50 border border-surface-700 rounded-full px-3 py-1.5 text-surface-300">
                <Icon className={`w-3.5 h-3.5 ${color}`} />{label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <PrivacyToggle enabled={privacyEnabled} onToggle={() => setPrivacyEnabled((p) => !p)} />
        </div>
        <CodeInput
          code={code} setCode={setCode} inputType={inputType} setInputType={setInputType}
          onGenerate={generate} onReset={reset} loading={loading} hasResults={!!data}
        />
      </div>

      {error && <div className="mt-6"><ErrorDisplay error={error} /></div>}
      {loading && <LoadingState />}

      {data && (
        <div className="mt-8 space-y-4">
          {/* Action bar */}
          <div className="flex items-center justify-between">
            <PrivacyBanner privacyInfo={privacyInfo} />
            <div className="flex items-center gap-2">
              {suiteId && <ExportMenu suiteId={suiteId} />}
              {suiteId && (
                <Link to={`/history/${suiteId}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-surface-400 hover:text-accent hover:bg-surface-800 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />View Saved
                </Link>
              )}
            </div>
          </div>
          <ResultsPanel data={data} meta={meta} />
        </div>
      )}
    </div>
  );
}
