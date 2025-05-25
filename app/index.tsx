import React, { useState, useEffect } from "react";
import { View, Text} from "react-native";
import { useRouter } from "expo-router";
import { setupApp } from "../store/globalAction";
import { RootState } from "../store/globalStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AppDispatch } from "../store/globalStore";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { sortRoutes } from "expo-router/build/sortRoutes";
import * as SecureStore from "expo-secure-store";
import setUserInfo from "../store/globalReducer";

export default function RootLayout() {
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const { userInfo, isSetupLoading } = useSelector(
    (state: RootState) => state.global
  );

  const [isFirstInstall, setIsFirstInstall] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

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

        const token = await SecureStore.getItemAsync("access_token");
        console.log("token", token)

        if (token) {
          type MyJwtPayload = { exp: number; name?: string };
          const res = jwtDecode<MyJwtPayload>(token);
          if (res && typeof res.exp === "number") {
            if (Date.now() < res.exp * 1000) {
              setIsAuth(true);
              if (res.name) AsyncStorage.setItem("user_name", res.name)
              else AsyncStorage.setItem("user_name", "none")
              console.log("token_payload", res)
            }
          }
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
      else if(isAuth) router.replace("/home");
      else router.replace("/login");
    }
  }, [isSetupLoading, isFirstInstall, isLoading, isAuth]);

  return (
    <View>
      <Text>Loading user data...</Text>
    </View>
  );
}
