import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Button,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { logout } from "@/services/auth";

import { AppDispatch } from "@/store/globalStore";
import { useDispatch, useSelector } from "react-redux";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "@/components/ui/header";
import UserInfoCard from "@/components/ui/UserInfo";
import InfoCard from "@/components/ui/InfoCard";
// import WeeklyRevenueCard from '@/components/ui/WeeklyRevenueCard';
import FeatureItem from "@/components/ui/FeatureItem";
import * as SecureStore from "expo-secure-store";
import {
  setUserInfo,
  setAccessToken,
  setRefreshToken,
} from "@/store/globalReducer";

import { RootState } from "@/store/globalStore";

export default function Explore() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { userInfo, accessToken } = useSelector(
    (state: RootState) => state.global
  );

  const [activeTab, setActiveTab] = useState("Home");

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Làm trong suốt thanh trạng thái */}
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        {/* Header */}
        <Header />

        {/* User Info */}
        <View style={styles.subcontainer}>
          <View style={styles.userSection}>
            <UserInfoCard
              name={userInfo.name ?? "none"}
              role="Owner"
              initial={(userInfo.name[0] ?? 'n').toUpperCase()}
              onPress={() => console.log("User card tapped")}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await AsyncStorage.removeItem("user_name");
            await SecureStore.deleteItemAsync("access_token");

            const refreshToken = await SecureStore.getItemAsync(
              "refresh_token"
            );
            await logout(accessToken, refreshToken || "");

            await SecureStore.deleteItemAsync("refresh_token");
            dispatch(setUserInfo({ name: "", id: 0 }));
            dispatch(setAccessToken(""));
            dispatch(setRefreshToken(""));

            if (router.canDismiss()) {
              router.dismissAll();
            }
            router.replace("/login");
          }}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ECFCCB",
    // flex: 1,
  },
  subcontainer: {
    backgroundColor: "#ECFCCB",
    flex: 1,
    // padding: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  userSection: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mainFeatureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 30, // More rounded
    alignItems: "center",
    width: "90%", // Full width of parent (matches UserInfoCard if parent is padded)
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    margin: 10,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
