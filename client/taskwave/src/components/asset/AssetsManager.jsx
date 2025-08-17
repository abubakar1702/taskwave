const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const getToken = () =>
  localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

const fetchJSON = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Request failed");
  }
  if (options.method === "DELETE") return true;
  return res.json();
};

export const fetchAssets = async (taskId, projectId) => {
  const url = new URL(`${API_BASE_URL}/api/assets/`);
  if (taskId) url.searchParams.append("task", taskId);
  if (projectId) url.searchParams.append("project", projectId);

  return fetchJSON(url.toString());
};

export const uploadAsset = async ({ file, taskId, projectId }) => {
  const jwtToken =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  const formData = new FormData();
  formData.append("file", file);
  if (taskId) formData.append("task", taskId);
  if (projectId) formData.append("project", projectId);

  const response = await fetch(`${API_BASE_URL}/api/assets/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to upload asset");
  }

  return await response.json();
};

export const removeAsset = async (assetId) => {
  return fetchJSON(`${API_BASE_URL}/api/assets/${assetId}/delete/`, {
    method: "DELETE",
  });
};
