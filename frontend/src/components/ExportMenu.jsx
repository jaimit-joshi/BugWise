import React, { useState, useRef, useEffect } from "react";
import { Download, FileText, Table, FileCode2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

const FORMATS = [
  { id: "pdf", label: "PDF Report", icon: FileText, ext: ".pdf" },
  { id: "csv", label: "CSV Test Cases", icon: Table, ext: ".csv" },
  { id: "feature", label: "Gherkin .feature", icon: FileCode2, ext: ".feature" },
];

export default function ExportMenu({ suiteId }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleExport = (format) => {
    const token = localStorage.getItem("bw_token");
    const url = `${API}/api/suites/${suiteId}/export/${format}`;

    // Create a temporary link with auth header via fetch
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error("Export failed");
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        const fmt = FORMATS.find((f) => f.id === format);
        a.download = `bugwise-export${fmt?.ext || ""}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => console.error("Export error:", err));

    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-surface-400 hover:text-accent hover:bg-surface-700 transition-colors"
        title="Export"
      >
        <Download className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-surface-800 border border-surface-700 rounded-lg shadow-xl z-50 py-1 animate-fade-in">
          {FORMATS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleExport(id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-surface-300 hover:bg-surface-700 hover:text-surface-100 transition-colors"
            >
              <Icon className="w-3.5 h-3.5 text-surface-400" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
