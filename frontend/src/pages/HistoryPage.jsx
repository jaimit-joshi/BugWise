import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSuites } from "../hooks/useSuites.js";
import SuiteCard from "../components/SuiteCard.jsx";
import ResultsPanel from "../components/ResultsPanel.jsx";
import ExportMenu from "../components/ExportMenu.jsx";
import { Search, ArrowLeft, Clock, Cpu, GitCompare } from "lucide-react";

export default function HistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    suites, suite, loading, error, pagination,
    fetchSuites, fetchSuite, deleteSuite,
  } = useSuites();

  const [search, setSearch] = useState("");
  const [diffSelect, setDiffSelect] = useState(null);

  // Fetch list or detail based on URL
  useEffect(() => {
    if (id) {
      fetchSuite(id);
    } else {
      fetchSuites({ search: search || undefined });
    }
  }, [id, fetchSuites, fetchSuite]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSuites({ search: search || undefined });
  };

  const handleDelete = async (suiteId) => {
    const success = await deleteSuite(suiteId);
    if (success && id === suiteId) {
      navigate("/history");
    }
  };

  const handleDiffSelect = (suiteId) => {
    if (!diffSelect) {
      setDiffSelect(suiteId);
    } else if (diffSelect !== suiteId) {
      navigate(`/diff/${diffSelect}/${suiteId}`);
      setDiffSelect(null);
    }
  };

  // ── Detail View ──────────────────────────────────────────
  if (id) {
    if (loading) {
      return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl shimmer" />)}</div>
        </div>
      );
    }

    if (!suite) {
      return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-surface-400">Suite not found.</p>
          <Link to="/history" className="text-accent text-sm mt-2 inline-block">← Back to History</Link>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back & header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/history")} className="p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-white">{suite.title}</h2>
              <div className="flex items-center gap-3 text-xs text-surface-500 mt-0.5">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(suite.createdAt).toLocaleString()}</span>
                <span className="flex items-center gap-1"><Cpu className="w-3 h-3" />{suite.model}</span>
                {suite.processingTimeMs && <span>{(suite.processingTimeMs / 1000).toFixed(1)}s</span>}
              </div>
            </div>
          </div>
          <ExportMenu suiteId={suite._id} />
        </div>

        {/* Input code preview */}
        {suite.inputCode && (
          <details className="mb-6">
            <summary className="text-xs text-surface-400 cursor-pointer hover:text-surface-200 transition-colors">Show Input Code</summary>
            <pre className="mt-2 p-3 rounded-lg bg-surface-900 border border-surface-700 text-xs text-surface-300 font-mono overflow-x-auto max-h-48">
              {suite.inputCode}
            </pre>
          </details>
        )}

        {/* Privacy info */}
        {suite.privacyShield?.redactions?.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-accent/5 border border-accent/20 text-xs text-surface-400">
            Privacy Shield redacted {suite.privacyShield.redactions.length} pattern type(s) before AI processing.
          </div>
        )}

        {/* Results */}
        <ResultsPanel data={suite.result} meta={{ processingTimeMs: suite.processingTimeMs }} />
      </div>
    );
  }

  // ── List View ────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Test Suite History</h2>
        {diffSelect && (
          <div className="flex items-center gap-2 text-xs text-accent bg-accent/10 rounded-lg px-3 py-1.5 border border-accent/30">
            <GitCompare className="w-3.5 h-3.5" />
            Select a second suite to compare
            <button onClick={() => setDiffSelect(null)} className="ml-2 text-surface-400 hover:text-surface-200">Cancel</button>
          </div>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suites..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-900 border border-surface-700 text-surface-100 text-sm focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-lg shimmer" />)}</div>
      ) : suites.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-surface-400 text-sm">No suites found.</p>
          <Link to="/generate" className="text-accent text-sm mt-2 inline-block">Generate your first suite →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {suites.map((s) => (
            <div key={s._id} className="relative">
              <SuiteCard suite={s} onDelete={handleDelete} />
              <button
                onClick={() => handleDiffSelect(s._id)}
                className={`absolute top-4 right-32 p-1.5 rounded-md transition-colors ${
                  diffSelect === s._id
                    ? "bg-accent/20 text-accent"
                    : "text-surface-500 hover:text-surface-300 hover:bg-surface-700"
                }`}
                title="Compare"
              >
                <GitCompare className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchSuites({ page: p, search: search || undefined })}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                p === pagination.page
                  ? "bg-accent text-surface-950"
                  : "bg-surface-800 text-surface-400 hover:text-surface-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
