import React from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";

export default function PrivacyToggle({ enabled, onToggle }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onToggle}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${
          enabled ? "bg-accent/30 border border-accent/50" : "bg-surface-700 border border-surface-600"
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span className={`inline-block h-5 w-5 rounded-full transition-transform duration-300 shadow-md ${
          enabled ? "translate-x-6 bg-accent" : "translate-x-1 bg-surface-400"
        }`} />
      </button>
      <div className="flex items-center gap-1.5">
        {enabled ? <ShieldCheck className="w-4 h-4 text-accent" /> : <ShieldOff className="w-4 h-4 text-surface-400" />}
        <span className={`text-sm font-medium ${enabled ? "text-accent" : "text-surface-400"}`}>
          Privacy Shield {enabled ? "Active" : "Inactive"}
        </span>
      </div>
    </div>
  );
}
