import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getActiveStorage = () => {
  if (localStorage.getItem("accessToken")) return localStorage;
  if (sessionStorage.getItem("accessToken")) return sessionStorage;
  return null;
};


const normalizeUserData = (userData) => {
  if (!userData) return null;
  
  return {
    id: userData.id,
    email: userData.email,
    username: userData.username,
    firstName: userData.firstName || userData.first_name || '',
    lastName: userData.lastName || userData.last_name || '',
    name: userData.name || `${userData.firstName || userData.first_name || ''} ${userData.lastName || userData.last_name || ''}`.trim() || 'User',
    ...userData,
  };
};

const getUserFromStorage = () => {
  const localStorage_user = localStorage.getItem("user");
  const sessionStorage_user = sessionStorage.getItem("user");
  const userString = localStorage_user || sessionStorage_user;

  if (userString) {
    try {
      const userData = JSON.parse(userString);
      return normalizeUserData(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }
  return null;
};

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const storage = getActiveStorage();
      const accessToken = storage?.getItem("accessToken");
      const refreshToken = storage?.getItem("refreshToken");

      console.log("Logging out...");
      console.log("Access token:", accessToken);
      console.log("Refresh token:", refreshToken);

      if (accessToken && refreshToken) {
        await axios.post(
          `${API_BASE_URL}/api/users/logout/`,
          { refresh: refreshToken },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
      }

      localStorage.clear();
      sessionStorage.clear();

      return true;
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);

      localStorage.clear();
      sessionStorage.clear();

      return true;
    }
  }
);

const initialState = {
  user: getUserFromStorage(),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = normalizeUserData(action.payload);
      state.isAuthenticated = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.user = null;
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearError, logout } = authSlice.actions;
export default authSlice.reducer;