import { createAsyncThunk } from "@reduxjs/toolkit";

import AsyncStorage from "@react-native-async-storage/async-storage";

export const setupApp = createAsyncThunk<
  boolean | undefined,
  void,
  { rejectValue: Error }
>("getIsFirstInstall", async () => {
  try {
    const isFirstInstall = await AsyncStorage.getItem("isFirstInstall");
    if (isFirstInstall === null) {
      await AsyncStorage.setItem("isFirstInstall", "true");
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error fetching books:", error);
  }
});

export const resetFirstInstall = createAsyncThunk<
  void | undefined,
  void,
  { rejectValue: Error }
>("resetFirstInstall", async () => {
  try {
    await AsyncStorage.removeItem("isFirstInstall");
  } catch (error) {
    console.error("Error resetting first install:", error);
  }
});
