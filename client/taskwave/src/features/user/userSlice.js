import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: null, // you can use a real image later
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.name = '';
      state.email = '';
      state.avatar = null;
    },
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;