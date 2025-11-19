import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark";

type UiState = {
  theme: Theme;
  sidebarOpen: boolean;
};

const initialState: UiState = {
  theme: "light",
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, setSidebarOpen } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
