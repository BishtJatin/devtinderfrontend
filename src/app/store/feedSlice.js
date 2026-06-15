import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  feedUsers: [],
  loading: false,
};

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    setFeed: (state, action) => {
      state.feedUsers = action.payload;
      state.loading = false;
    },
    removeUserFromFeed: (state, action) => {
      state.feedUsers = state.feedUsers.filter((user) => user._id !== action.payload);
    },
    setFeedLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearFeed: (state) => {
      state.feedUsers = [];
      state.loading = false;
    },
  },
});

export const { setFeed, removeUserFromFeed, setFeedLoading, clearFeed } = feedSlice.actions;
export default feedSlice.reducer;
