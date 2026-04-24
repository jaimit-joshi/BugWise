import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, FlaskConical, FileCode2, Trash2, Eye } from "lucide-react";
import ExportMenu from "./ExportMenu.jsx";

export default function SuiteCard({ suite, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  const handleDelete = () => {
    if (confirming) {
      onDelete(suite._id);
      setConfirming(false);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    }
  };

  const date = new Date(suite.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  const time = new Date(suite.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="border border-surface-700 rounded-lg bg-surface-800/30 hover:border-surface-600 transition-colors p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link to={`/history/${suite._id}`} className="text-sm font-semibold text-surface-100 hover:text-accent transition-colors truncate block">
            {suite.title || "Untitled Suite"}
          </Link>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-surface-500">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{date} {time}</span>
            <span className="px-1.5 py-0.5 bg-surface-700/50 rounded text-[10px] uppercase">{suite.inputType}</span>
            <span className="text-[10px] text-surface-600">{suite.model}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link to={`/history/${suite._id}`} className="p-2 rounded-lg text-surface-400 hover:text-accent hover:bg-surface-700 transition-colors" title="View">
            <Eye className="w-4 h-4" />
          </Link>
          <ExportMenu suiteId={suite._id} />
          <button onClick={handleDelete} className={`p-2 rounded-lg transition-colors ${confirming ? "text-danger bg-danger/10" : "text-surface-400 hover:text-danger hover:bg-surface-700"}`} title={confirming ? "Click again to confirm" : "Delete"}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {suite.processingTimeMs && (
        <div className="mt-3 flex items-center gap-4 text-xs text-surface-500">
          <span>{(suite.processingTimeMs / 1000).toFixed(1)}s generation</span>
        </div>
      )}
    </div>
  );
}
