import { createAsyncThunk } from "@reduxjs/toolkit";

import AsyncStorage from "@react-native-async-storage/async-storage";

import UserInfo from "../types/UserInfo";

export const setupApp = createAsyncThunk<
  UserInfo | undefined,
  void,
  { rejectValue: Error }
>("setupApp", async () => {
  try {
    const userInfoStr = await AsyncStorage.getItem("userInfo");
    const userInfo: UserInfo | null = userInfoStr ? JSON.parse(userInfoStr) : null;
    if (userInfo === null) {
      await AsyncStorage.setItem("userInfo", "");
      return undefined;
    } else {
      return userInfo;
    }
  } catch (error) {
    console.error("Error fetching books:", error);
  }
});
