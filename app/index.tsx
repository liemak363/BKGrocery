import React, { useState, useEffect } from "react";
import { View, Text} from "react-native";
import { useRouter } from "expo-router";
import { setupApp } from "../store/globalAction";
import { RootState } from "../store/globalStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AppDispatch } from "../store/globalStore";
import { useSelector, useDispatch } from "react-redux";

export default function RootLayout() {
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const { userInfo, isSetupLoading } = useSelector(
    (state: RootState) => state.global
  );

  const [isFirstInstall, setIsFirstInstall] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user data when the app starts
    dispatch(setupApp());
    const getIsFirstInstall = async () => {
      setIsLoading(true);
      try {
        const isFirstInstallLocal = await AsyncStorage.getItem("isFirstInstall");
        if (isFirstInstallLocal === null) {
          await AsyncStorage.setItem("isFirstInstall", "true");
          setIsFirstInstall(true);
        } else {
          setIsFirstInstall(JSON.parse(isFirstInstallLocal));
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching books:", error);
        setIsLoading(false);
      }
    }
    getIsFirstInstall();
  }, []);

  useEffect(() => {
    if (!isSetupLoading && !isLoading) {
      if (isFirstInstall) router.replace("/onboard");
      else router.replace("/home");
    }
  }, [isSetupLoading, isFirstInstall]);

  return (
    <View>
      <Text>Loading user data...</Text>
    </View>
  );
}
