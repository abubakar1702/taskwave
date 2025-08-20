import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const fetchTaskDetail = createAsyncThunk(
  "taskDetail/fetchTaskDetail",
  async ({ taskId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tasks/${taskId}/`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchAssignees = createAsyncThunk(
  "taskDetail/fetchAssignees",
  async ({ taskId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/task/${taskId}/assignees/`,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const addAssignees = createAsyncThunk(
  "taskDetail/addAssignees",
  async ({ taskId, assigneeIds }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/task/${taskId}/assignees/`,
        { assignees: assigneeIds },
        { headers: getAuthHeaders() }
      );

      console.log("API Response:", response.data);

      const assigneesData = response.data;

      return {
        taskId,
        assigneeIds,
        assignees: Array.isArray(assigneesData)
          ? assigneesData
          : assigneesData.assignees || assigneesData.results || [],
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const removeAssignee = createAsyncThunk(
  "taskDetail/removeAssignee",
  async ({ taskId, userId }, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/task/${taskId}/assignees/${userId}/remove/`,
        { headers: getAuthHeaders() }
      );
      await dispatch(fetchTaskDetail({ taskId }));
      return { userId };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const leaveTask = createAsyncThunk(
  "taskDetail/leaveTask",
  async ({ taskId, userId }, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/task/${taskId}/assignees/${userId}/remove/`,
        { headers: getAuthHeaders() }
      );

      return { userId };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchAvailableUsers = createAsyncThunk(
  "taskDetail/fetchAvailableUsers",
  async ({ projectId, taskId, query }, { rejectWithValue }) => {
    try {
      const params = { q: query };

      if (projectId) params.project_id = projectId;
      if (taskId) params.task_id = taskId;

      const response = await axios.get(`${API_BASE_URL}/api/users/search/`, {
        params,
        headers: getAuthHeaders(),
      });

      return response.data.results || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const taskDetailSlice = createSlice({
  name: "taskDetail",
  initialState: {
    task: null,
    items: [],
    availableUsers: [],
    selectedUsers: [],
    loading: false,
    error: null,
  },
  reducers: {
    selectUser: (state, action) => {
      if (!state.selectedUsers.some((user) => user.id === action.payload.id)) {
        state.selectedUsers.push(action.payload);
      }
    },
    removeSelectedUser: (state, action) => {
      state.selectedUsers = state.selectedUsers.filter(
        (user) => user.id !== action.payload
      );
    },
    clearSelectedUsers: (state) => {
      state.selectedUsers = [];
    },

    setAssignees: (state, action) => {
      state.items = action.payload;
    },
    clearAssignees: (state) => {
      state.items = [];
    },
    clearAvailableUsers: (state) => {
      state.availableUsers = [];
    },
    updateTaskAssignees: (state, action) => {
      if (state.task) {
        state.task.assignees = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignees.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAssignees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addAssignees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAssignees.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        let newAssignees = [];

        if (Array.isArray(action.payload)) {
          newAssignees = action.payload;
        } else if (Array.isArray(action.payload.assignees)) {
          newAssignees = action.payload.assignees;
        } else if (action.payload.assignees) {
          newAssignees = [action.payload.assignees];
        }
        newAssignees.forEach((assignee) => {
          if (
            assignee &&
            !state.items.some((item) => item.id === assignee.id)
          ) {
            state.items.push(assignee);
          }
        });
        state.selectedUsers = [];
      })
      .addCase(addAssignees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(removeAssignee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeAssignee.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          (user) => user.id !== action.payload.userId
        );
      })
      .addCase(removeAssignee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAvailableUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.availableUsers = action.payload;
      })
      .addCase(fetchAvailableUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTaskDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.task = action.payload;
      })
      .addCase(fetchTaskDetail.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.detail ||
          action.error.message ||
          "Something went wrong";
      })
      .addCase(leaveTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveTask.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task && state.task.assignees) {
          state.task.assignees = state.task.assignees.filter(
            (assignee) => assignee.id !== action.payload.userId
          );
        }
      })
      .addCase(leaveTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default taskDetailSlice.reducer;
export const {
  selectUser,
  removeSelectedUser,
  clearSelectedUsers,
  setAssignees,
  clearAssignees,
  clearAvailableUsers,
} = taskDetailSlice.actions;
