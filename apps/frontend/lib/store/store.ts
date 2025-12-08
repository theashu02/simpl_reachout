import { configureStore } from "@reduxjs/toolkit";
import { uiReducer } from "./slices/ui-slice";
import { roomReducer } from "./slices/roomSlice";

// Creates a new store instance per request to keep server-rendered payloads isolated.

export const makeStore = () =>
  configureStore({
    reducer: {
      ui: uiReducer,
      room: roomReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<AppStore["getState"]>;
