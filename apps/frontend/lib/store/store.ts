import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { uiReducer } from "./slices/ui-slice";
import { roomReducer } from "./slices/roomSlice";
import userDataReducer from "./slices/userDataSlice";

const rootReducer = combineReducers({
  ui: uiReducer,
  room: roomReducer,
  user: userDataReducer,
});

export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    devTools: process.env.NODE_ENV !== "production",
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];
