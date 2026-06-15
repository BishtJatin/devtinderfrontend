import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  connections: [],
  loading: false,
  activeConnectionId: null,
};

const connectionSlice = createSlice({
  name: "connections",
  initialState,
  reducers: {
    setConnections: (state, action) => {
      state.connections = action.payload;
      state.loading = false;
    },
    setConnectionLoading: (state, action) => {
      state.loading = action.payload;
    },
    setActiveConnectionId: (state, action) => {
      state.activeConnectionId = action.payload;
    },
    clearConnections: (state) => {
      state.connections = [];
      state.loading = false;
      state.activeConnectionId = null;
    },
  },
});

export const { setConnections, setConnectionLoading, setActiveConnectionId, clearConnections } = connectionSlice.actions;
export default connectionSlice.reducer;
