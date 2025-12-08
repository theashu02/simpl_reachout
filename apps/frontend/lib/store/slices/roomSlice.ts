import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type RoomStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

type RoomState = {
  roomId: string | null;
  status: RoomStatus;
};

const initialState: RoomState = {
  roomId: null,
  status: "idle",
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoomId(state, action: PayloadAction<string | null>) {
      state.roomId = action.payload;
    },
    setRoomStatus(state, action: PayloadAction<RoomStatus>) {
      state.status = action.payload;
    },
    // Helper to reset the state when leaving a room
    resetRoom(state) {
      state.roomId = null;
      state.status = "idle";
    },
  },
});

export const { setRoomId, setRoomStatus, resetRoom } = roomSlice.actions;
export const roomReducer = roomSlice.reducer;