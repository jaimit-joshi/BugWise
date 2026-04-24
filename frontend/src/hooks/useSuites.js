import { useState, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export function useSuites() {
  const [suites, setSuites] = useState([]);
  const [suite, setSuite] = useState(null);
  const [stats, setStats] = useState(null);
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchSuites = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/api/suites`, { params });
      if (res.data.success) {
        setSuites(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch suites.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSuite = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    setSuite(null);
    try {
      const res = await axios.get(`${API}/api/suites/${id}`);
      if (res.data.success) {
        setSuite(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch suite.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSuite = useCallback(async (id) => {
    try {
      const res = await axios.delete(`${API}/api/suites/${id}`);
      if (res.data.success) {
        setSuites((prev) => prev.filter((s) => s._id !== id));
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete suite.");
    }
    return false;
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/suites/stats`);
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch stats.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDiff = useCallback(async (id1, id2) => {
    setLoading(true);
    setDiff(null);
    setError(null);
    try {
      const res = await axios.get(`${API}/api/suites/diff/${id1}/${id2}`);
      if (res.data.success) {
        setDiff(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to compare suites.");
    } finally {
      setLoading(false);
    }
  }, []);

  const getExportUrl = useCallback((id, format) => {
    return `${API}/api/suites/${id}/export/${format}`;
  }, []);

  return {
    suites,
    suite,
    stats,
    diff,
    loading,
    error,
    pagination,
    fetchSuites,
    fetchSuite,
    deleteSuite,
    fetchStats,
    fetchDiff,
    getExportUrl,
  };
}
