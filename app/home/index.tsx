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

import { AppDispatch } from "../../store/globalStore";
import { useDispatch, useSelector } from "react-redux";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "@/components/ui/header";
import UserInfoCard from "@/components/ui/UserInfo";
import InfoCard from "@/components/ui/InfoCard";
// import WeeklyRevenueCard from '@/components/ui/WeeklyRevenueCard';
import FeatureItem from "@/components/ui/FeatureItem";
import BottomNavBar from "@/components/ui/BottomNavBar";
import * as SecureStore from "expo-secure-store";

import { RootState } from "../../store/globalStore";

export default function Explore() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { userInfo, isSetupLoading } = useSelector(
    (state: RootState) => state.global
  );

  const [activeTab, setActiveTab] = useState("Home");
  const [userName, setUserName] = useState("none");

  const handleTabPress = (tab: string) => {
    console.log(tab);
    // Map tab names to valid route paths
    let route: string;
    route = "./" + tab
    router.replace(route as any);
    setActiveTab(tab);
  };

  useEffect(() => {
    const fetchUserName = async () => {
      const res = await AsyncStorage.getItem("user_info");
      const userInfo = res ? JSON.parse(res) : null;
      setUserName(userInfo.name ?? "none");
    };
    fetchUserName();
  }, []);

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
              name={userName}
              role="Owner"
              initial={userName[0].toUpperCase()}
              onPress={() => console.log("User card tapped")}
            />

            <View style={styles.statsRow}>
              <InfoCard
                value="30657 $"
                label="Total revenue"
                onPress={() => console.log("Revenue card pressed")}
              />

              <InfoCard
                value={1004}
                label="Total item"
                onPress={() => console.log("Total item card pressed")}
              />
            </View>
          </View>

          {/* <WeeklyRevenueCard
          title="Week’s Revenue"
          total="16,345 $"
          percentageChange="1.3%"
          changeLabel="VS LAST WEEK"
          data={[3900, 600, 950, 500, 1900, 900, 2900]}
        /> */}

          <View style={{ marginBottom: 100 }}>
            <Text style={styles.mainFeatureTitle}>Main feature</Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <FeatureItem
                image={require("../../assets/images/warehouse.png")}
                label="Warehouse"
                onPress={() => router.replace('/warehouse' as any)}

              />

              <FeatureItem
                image={require("../../assets/images/import.png")}
                label="Import"
                onPress={() => router.replace('/import' as any)}
              />
              <FeatureItem
                image={require("../../assets/images/historyicon.png")}
                label="History"
                onPress={() => router.replace('/history' as any)}
              />
              <FeatureItem
                image={require("../../assets/images/scanicon.png")}
                label="Import Log"
                // onPress={() => router.replace('/import' as any)}
              />
              <FeatureItem
                image={require("../../assets/images/receipicon.png")}
                label="Receipt"
                onPress={() => router.replace('/receipt' as any)}
              />
              <FeatureItem
                image={require("../../assets/images/settingicon.png")}
                label="Setting"
                onPress={() => router.replace('/setting' as any)}
              />
            </View>
            
            <Button
              title="reset 363"
              onPress={() => {
                AsyncStorage.removeItem("isFirstInstall");
                AsyncStorage.removeItem("userInfo");
                SecureStore.deleteItemAsync("access_token");
                SecureStore.deleteItemAsync("refresh_token");
              }}
            />
          </View>
        </View>
      </ScrollView>
      <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
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
});
