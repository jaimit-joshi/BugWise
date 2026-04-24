import { useState, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export function useGenerateTests() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  const [privacyInfo, setPrivacyInfo] = useState(null);
  const [suiteId, setSuiteId] = useState(null);

  const generate = useCallback(async (code, inputType = "code") => {
    setLoading(true);
    setError(null);
    setData(null);
    setMeta(null);
    setPrivacyInfo(null);
    setSuiteId(null);

    try {
      const res = await axios.post(
        `${API}/api/generate-tests`,
        { code, inputType },
        { timeout: 120000 }
      );

      if (res.data.success) {
        setData(res.data.data);
        setMeta(res.data.meta);
        setPrivacyInfo(res.data.privacyShield);
        setSuiteId(res.data.suiteId);
      } else {
        setError(res.data.error || "Unknown error occurred.");
      }
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        "Failed to connect to the server.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setMeta(null);
    setPrivacyInfo(null);
    setSuiteId(null);
  }, []);

  return { data, loading, error, meta, privacyInfo, suiteId, generate, reset };
}
