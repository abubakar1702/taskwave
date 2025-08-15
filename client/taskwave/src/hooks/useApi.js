import { useState, useEffect } from "react";
import axios from "axios";

export function useApi(url, method = "GET", body = null, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios({
          method,
          url,
          ...(method.toUpperCase() !== "GET" && body ? { data: body } : {}),
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });
        setData(res.data);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError({
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [...deps, url, method]);

  return { data, loading, error };
}