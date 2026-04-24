import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorDisplay({ error }) {
  if (!error) return null;
  return (
    <div className="animate-fade-in rounded-xl border border-danger/30 bg-danger/5 p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-danger-light">Generation Failed</p>
        <p className="text-sm text-surface-300 mt-1">{error}</p>
      </div>
    </div>
  );
}
