import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { setupApp } from "./globalAction";

import UserInfo from "../types/UserInfo";

export interface GlobalState {
  isSetupLoading: boolean;
  accessToken: string;
  refreshToken: string;
  userInfo: UserInfo;
}

const initialState: GlobalState = {
  isSetupLoading: true,
  accessToken: "",
  refreshToken: "",
  userInfo: {
    name: "",
    id: 0,
  }
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    // Redux Toolkit allows us to write "mutating" logic in reducers. It
    // doesn't actually mutate the state because it uses the Immer library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes
    // incrementByAmount: (state, action: PayloadAction<number>) => {
    //   state.isFirstInstall += action.payload;
    // },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      state.refreshToken = action.payload;
    },
    setUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setupApp.pending, (state) => {
      state.isSetupLoading = true;
    });

    builder.addCase(
      setupApp.fulfilled,
      (state, action: PayloadAction<UserInfo | undefined>) => {
        if (action.payload) {
          state.userInfo = action.payload;
        }
        state.isSetupLoading = false;
      }
    );
  },
});

// Action creators are generated for each case reducer function
// export const { increment, decrement, incrementByAmount } = globalSlice.actions;
export const { setAccessToken, setRefreshToken, setUserInfo } = globalSlice.actions;

export default globalSlice.reducer;
