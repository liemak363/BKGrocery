import React, { useEffect } from "react";
import { View, Text} from "react-native";
import { useRouter } from "expo-router";
import { setupApp } from "../store/globalAction";
import { RootState } from "../store/globalStore";

import { AppDispatch } from "../store/globalStore";
import { useSelector, useDispatch } from "react-redux";

export default function RootLayout() {
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const { isFirstInstall, isSetupLoading } = useSelector(
    (state: RootState) => state.global
  );

  useEffect(() => {
    // Load user data when the app starts
    dispatch(setupApp());
  }, [dispatch]);

  useEffect(() => {
    if (!isSetupLoading) {
      if (isFirstInstall) router.replace("/home");
      else router.replace("/home");
    }
  }, [isSetupLoading, isFirstInstall]);

  return (
    <View>
      <Text>Loading user data...</Text>
    </View>
  );
}
