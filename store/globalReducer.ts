import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { setupApp, resetFirstInstall } from "./globalAction";

export interface GlobalState {
  isFirstInstall: boolean;
  isSetupLoading: boolean;
}

const initialState: GlobalState = {
  isFirstInstall: true,
  isSetupLoading: true,
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
  },
  extraReducers: (builder) => {
    builder.addCase(setupApp.pending, (state) => {
      state.isSetupLoading = true;
    });

    builder.addCase(
      setupApp.fulfilled,
      (state, action: PayloadAction<boolean | undefined>) => {
        state.isFirstInstall = action.payload ?? false;
        state.isSetupLoading = false;
      }
    );
    builder.addCase(resetFirstInstall.fulfilled, (state) => {
      state.isFirstInstall = true;
    });
  },
});

// Action creators are generated for each case reducer function
// export const { increment, decrement, incrementByAmount } = globalSlice.actions;

export default globalSlice.reducer;
