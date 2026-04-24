import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSuites } from "../hooks/useSuites.js";
import DiffViewer from "../components/DiffViewer.jsx";
import { ArrowLeft } from "lucide-react";

export default function DiffPage() {
  const { id1, id2 } = useParams();
  const { diff, loading, error, fetchDiff } = useSuites();

  useEffect(() => {
    if (id1 && id2) {
      fetchDiff(id1, id2);
    }
  }, [id1, id2, fetchDiff]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/history" className="p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h2 className="text-xl font-bold text-white">Suite Comparison</h2>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-danger/10 border border-danger/30 text-sm text-danger-light mb-6">{error}</div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl shimmer" />)}
        </div>
      ) : diff ? (
        <DiffViewer diff={diff} />
      ) : !error ? (
        <p className="text-surface-500 text-sm text-center py-12">Select two suites from History to compare.</p>
      ) : null}
    </div>
  );
}
