import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { newAccessToken as getNewAccessToken } from "@/services/auth";

import { AppDispatch } from "../store/globalStore";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { sortRoutes } from "expo-router/build/sortRoutes";
import * as SecureStore from "expo-secure-store";
import { setUserInfo, setAccessToken } from "../store/globalReducer";

export default function RootLayout() {
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();

  const [isFirstInstall, setIsFirstInstall] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  // Hàm xử lý token hết hạn
  const handleExpiredToken = async () => {
    const refreshToken = await SecureStore.getItemAsync("refresh_token");
    if (refreshToken) {
      try {
        const response = await getNewAccessToken(refreshToken);

        await SecureStore.setItemAsync("access_token", response.access_token);
        if (response.refresh_token) {
          await SecureStore.setItemAsync(
            "refresh_token",
            response.refresh_token
          );
        }

        setIsAuth(true);

        // Định nghĩa lại kiểu MyJwtPayload cho token mới
        type MyJwtPayload = { exp?: number; name: string; sub: number };

        // Giải mã token mới để lấy thông tin người dùng cập nhật
        const newTokenData = jwtDecode<MyJwtPayload>(response.access_token);

        // In ra toàn bộ thông tin của token mới để kiểm tra
        console.log("Thông tin token mới:", newTokenData);

        const userInfo = {
          name: newTokenData.name,
          id: newTokenData.sub,
        };
        dispatch(setUserInfo(userInfo));
        dispatch(setAccessToken(response.access_token));

        console.log("New access token:", response);
      } catch (error: any) {
        setIsAuth(false);
        if (error.message === "Lấy token mới không thành công, xin thử lại") {
          console.error("Error getting new access token:", error);
        }
      }
    } else {
      setIsAuth(false);
    }
  };

  useEffect(() => {
    const getIsFirstInstall = async () => {
      setIsLoading(true);
      try {
        const isFirstInstallLocal = await AsyncStorage.getItem(
          "isFirstInstall"
        );
        if (isFirstInstallLocal === null) {
          await AsyncStorage.setItem("isFirstInstall", "false");
          setIsFirstInstall(true);
          return;
        } else {
          setIsFirstInstall(JSON.parse(isFirstInstallLocal));
        }

        const accessToken = await SecureStore.getItemAsync("access_token");
        console.log("access token", accessToken);

        if (accessToken) {
          // Định nghĩa kiểu dữ liệu với trường exp là tùy chọn
          type MyJwtPayload = { exp?: number; name: string; sub: number };

          try {
            // Decode và in ra toàn bộ payload để kiểm tra
            const decodedToken = jwtDecode(accessToken);
            console.log("Toàn bộ payload của token:", decodedToken);

            // Sử dụng kiểu MyJwtPayload để type safety
            const res = jwtDecode<MyJwtPayload>(accessToken);

            // Kiểm tra xem exp có tồn tại không
            if (res.exp) {
              console.log(
                "Thời gian hết hạn của token:",
                new Date(res.exp * 1000).toLocaleString()
              );

              if (Date.now() < res.exp * 1000) {
                // Token còn hạn
                setIsAuth(true);
                const userInfo = {
                  name: res.name,
                  id: res.sub,
                };
                dispatch(setUserInfo(userInfo));
                dispatch(setAccessToken(accessToken));
                console.log("token_payload", res);
              } else {
                // Token hết hạn, xử lý refresh token
                await handleExpiredToken();
              }
            } else {
              // Token không có trường exp, coi như luôn hợp lệ
              console.log(
                "Token không có trường exp! Coi như token luôn hợp lệ."
              );
              setIsAuth(true);
              const userInfo = {
                name: res.name,
                id: res.sub,
              };
              dispatch(setUserInfo(userInfo));
              dispatch(setAccessToken(accessToken));
            }
          } catch (error: any) {
            console.error("Lỗi khi xử lý token:", error);
            setIsAuth(false);
          }
        }

        setIsLoading(false);
      } catch (error: any) {
        console.error("error message first start:", error);
        setIsLoading(false);
      }
    };
    getIsFirstInstall();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (isFirstInstall) router.replace("/onboard" as any);
      else if (isAuth) router.replace("/home" as any);
      else {
        // clear all AsyncStorage and SecureStore
        AsyncStorage.clear();
        SecureStore.deleteItemAsync("access_token");
        SecureStore.deleteItemAsync("refresh_token");
        
        router.replace("/login" as any);
      }
    }
  }, [isFirstInstall, isLoading, isAuth]);

  return (
    <View>
      <Text>Loading user data...</Text>
    </View>
  );
}
