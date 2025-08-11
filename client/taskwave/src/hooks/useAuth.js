import { jwtDecode } from "jwt-decode";

const getActiveStorage = () => {
  if (localStorage.getItem("accessToken")) return localStorage;
  if (sessionStorage.getItem("accessToken")) return sessionStorage;
  return null;
};

export default function useAuth() {
  const localToken = localStorage.getItem("accessToken");
  const sessionToken = sessionStorage.getItem("accessToken");

  const token = localToken || sessionToken;
  const activeStorage = getActiveStorage();

  const isValidToken = (token) => {
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      return decoded.exp > currentTime;
    } catch (error) {
      console.error("Invalid token:", error);
      return false;
    }
  };

  const isAuthenticated = isValidToken(token);

  if (token && !isAuthenticated) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
  }

  return {
    isAuthenticated,
    token: isAuthenticated ? token : null,
    storage: activeStorage,
  };
}

export { getActiveStorage };
