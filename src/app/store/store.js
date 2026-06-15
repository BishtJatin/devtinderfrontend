import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import feedReducer from "./feedSlice";
import requestReducer from "./requestSlice";
import connectionReducer from "./connectionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    feed: feedReducer,
    requests: requestReducer,
    connections: connectionReducer,
  },
});
