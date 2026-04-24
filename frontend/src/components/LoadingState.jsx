import React, { useState, useEffect } from "react";
import { Brain } from "lucide-react";

const MSGS = [
  "Analyzing code structure...",
  "Identifying edge cases...",
  "Mapping error boundaries...",
  "Designing negative test scenarios...",
  "Building Gherkin features...",
  "Generating risk assessment...",
  "Crafting test data combinations...",
  "Finalizing test plan...",
];

export default function LoadingState() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setIdx((p) => (p + 1) % MSGS.length), 2500);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="animate-fade-in py-12">
      <div className="max-w-lg mx-auto text-center space-y-6">
        <div className="relative inline-flex">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center animate-pulse-glow">
            <Brain className="w-8 h-8 text-accent" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "4s" }}>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-accent rounded-full" />
          </div>
        </div>
        <div>
          <p className="text-accent font-medium text-sm mb-1">{MSGS[idx]}</p>
          <p className="text-surface-500 text-xs">This typically takes 15–30 seconds</p>
        </div>
        <div className="space-y-3 max-w-sm mx-auto">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-3 rounded-full shimmer" style={{ width: `${75 - i * 12}%`, animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
