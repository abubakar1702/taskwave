import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getActiveStorage = () => {
  const storageSources = [localStorage, sessionStorage];
  for (const storage of storageSources) {
    if (storage.getItem("accessToken")) {
      return storage;
    }
  }
  return null;
};

const clearAllAuthStorage = () => {
  ["accessToken", "refreshToken", "user"].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

const normalizeUserData = (userData) => {
  if (!userData) return null;

  const firstName = userData.firstName || userData.first_name || "";
  const lastName = userData.lastName || userData.last_name || "";
  const name = userData.name || `${firstName} ${lastName}`.trim() || "User";

  const initial = name.trim().charAt(0).toUpperCase() || "U";

  return {
    id: userData.id,
    email: userData.email,
    username: userData.username,
    firstName,
    lastName,
    name,
    initial,
    avatar: userData.avatar || userData.avatar_url || null,
    ...userData,
  };
};

const getUserFromStorage = () => {
  const storage = getActiveStorage();
  const userString = storage?.getItem("user");

  if (userString) {
    try {
      return normalizeUserData(JSON.parse(userString));
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }
  return null;
};

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const storage = getActiveStorage();
      const accessToken = storage?.getItem("accessToken");

      if (!accessToken) throw new Error("No access token found");

      const response = await axios.get(`${API_BASE_URL}/api/users/me/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });

      const normalizedUser = normalizeUserData(response.data);
      storage?.setItem("user", JSON.stringify(normalizedUser));
      return normalizedUser;
    } catch (error) {
      if (error.response?.status === 401) clearAllAuthStorage();
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const storage = getActiveStorage();
      const refreshToken = storage?.getItem("refreshToken");

      if (refreshToken) {
        await axios.post(
          `${API_BASE_URL}/api/users/logout/`,
          { refresh: refreshToken },
          {
            headers: {
              Authorization: `Bearer ${storage?.getItem("accessToken")}`,
            },
            withCredentials: true,
          }
        );
      }

      clearAllAuthStorage();
      return true;
    } catch (error) {
      clearAllAuthStorage();
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  user: getUserFromStorage(),
  isAuthenticated: !!getActiveStorage()?.getItem("accessToken"),
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
