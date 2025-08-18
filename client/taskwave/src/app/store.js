import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/user/userSlice";
import taskDetailReducer from "../features/task detail/taskDetailSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    taskDetail: taskDetailReducer,
  },
});
