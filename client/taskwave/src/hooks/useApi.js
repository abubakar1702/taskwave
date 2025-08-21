import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export function useApi(url, method = "GET", body = null, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (controller) => {
      if (!url) {
        setData(null);
        setLoading(false);
        setError(null);
        return;
      }

      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      setLoading(true);
      setError(null);
      try {
        const res = await axios({
          method,
          url,
          ...(method.toUpperCase() !== "GET" && body ? { data: body } : {}),
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller?.signal,
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
    },
    [url, method, body]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller);
    return () => controller.abort();
  }, [...deps, fetchData]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    fetchData(controller);
  }, [fetchData]);

  const makeRequest = useCallback(
    async (requestUrl, requestMethod = "POST", requestBody = null) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      try {
        const res = await axios({
          method: requestMethod,
          url: requestUrl,
          ...(requestMethod.toUpperCase() !== "GET" && requestBody
            ? { data: requestBody }
            : {}),
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return res.data;
      } catch (err) {
        throw {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        };
      }
    },
    []
  );

  return { data, loading, error, refetch, makeRequest };
}
