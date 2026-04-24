import React from "react";
import { ShieldCheck, Eye } from "lucide-react";

export default function PrivacyBanner({ privacyInfo }) {
  if (!privacyInfo || !privacyInfo.applied) return null;
  const hasRedactions = privacyInfo.redactions?.length > 0;

  return (
    <div className={`animate-fade-in rounded-lg p-3 flex items-start gap-3 text-sm ${
      hasRedactions ? "bg-accent/5 border border-accent/20" : "bg-surface-800/50 border border-surface-700"
    }`}>
      {hasRedactions ? <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" /> : <Eye className="w-4 h-4 text-surface-400 flex-shrink-0 mt-0.5" />}
      <div>
        {hasRedactions ? (
          <>
            <p className="text-accent font-medium text-xs">Privacy Shield Protected Your Data</p>
            <ul className="mt-1 space-y-0.5">
              {privacyInfo.redactions.map((r, i) => (
                <li key={i} className="text-xs text-surface-400">• {r.rule}: {r.count} instance{r.count > 1 && "s"} redacted</li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-surface-400 text-xs">Privacy Shield scanned — no sensitive data detected.</p>
        )}
      </div>
    </div>
  );
}
