import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserDataState {
  name: string;
  email: string;
  image?: string | null;
  isLoaded: boolean;
}

const initialState: UserDataState = {
  name: "",
  email: "",
  image: null,
  isLoaded: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<Partial<UserDataState>>) => {
      if (typeof action.payload.name !== "undefined") {
        state.name = action.payload.name;
      }

      if (typeof action.payload.email !== "undefined") {
        state.email = action.payload.email;
      }

      if (typeof action.payload.image !== "undefined") {
        state.image = action.payload.image;
      }

      state.isLoaded = true;
    },
    clearUserData: (state) => {
      state.name = "";
      state.email = "";
      state.image = null;
      state.isLoaded = false;
    },
  },
});

export const { setUserData, clearUserData } = userSlice.actions;
export default userSlice.reducer;
export const selectUser = (state: { user: UserDataState }) => state.user;
