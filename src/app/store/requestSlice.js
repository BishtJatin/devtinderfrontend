import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  requests: [],
  loading: false,
};

const requestSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    setRequests: (state, action) => {
      state.requests = action.payload;
      state.loading = false;
    },
    removeRequest: (state, action) => {
      state.requests = state.requests.filter((req) => req._id !== action.payload);
    },
    setRequestLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearRequests: (state) => {
      state.requests = [];
      state.loading = false;
    },
  },
});

export const { setRequests, removeRequest, setRequestLoading, clearRequests } = requestSlice.actions;
export default requestSlice.reducer;
