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
import { useRouter, useNavigation } from "expo-router";
import { importLog } from "@/services/import";
import { getSaleLogs } from "@/services/sale";

import { AppDispatch } from "@/store/globalStore";
import { useDispatch, useSelector } from "react-redux";
import { setAccessToken, setRefreshToken } from "@/store/globalReducer";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "@/components/ui/header";
import UserInfoCard from "@/components/ui/UserInfo";
import InfoCard from "@/components/ui/InfoCard";
// import WeeklyRevenueCard from '@/components/ui/WeeklyRevenueCard';
import FeatureItem from "@/components/ui/FeatureItem";
import * as SecureStore from "expo-secure-store";

import { RootState } from "@/store/globalStore";
import * as Sentry from '@sentry/react-native';


export default function Explore() {
    const { accessToken, refreshToken } = useSelector(
      (state: RootState) => state.global
  );

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const navigation = useNavigation();

  const [totalItems, setTotalItems] = useState(0);
  const [Revenue, setRevenue] = useState(0);
  const [activeTab, setActiveTab] = useState("home");
  const [userName, setUserName] = useState("none"); // Handle feature item press using tab navigation
  const handleFeaturePress = (featureName: string) => {
    let routeName: string;

    switch (featureName.toLowerCase()) {
      case "warehouse":
        routeName = "warehouse";
        break;
      case "import":
        routeName = "import";
        break;
      case "history":
        // Use router.push for saleLog since it's now a separate stack
        router.push("/main/saleLog");
        return;
      case "import log":
        routeName = "importLog";
        break;
      case "receipt":
        routeName = "receipt";
        break;
      case "setting":
        routeName = "setting";
        break;
      default:
        routeName = "index";
    }

    // Use navigation.navigate for tab navigation
    navigation.navigate(routeName as never);
  };
  // const sendTestError = () => {
  //   try {
  //     // Gây lỗi giả lập
  //     throw new Error('Đây là lỗi test gửi lên Sentry!');
  //   } catch (error) {
  //     Sentry.captureException(error);
  //   }
  // };

  useEffect(() => {
    const fetchUserName = async () => {
      const res = await AsyncStorage.getItem("user_info");
      const userInfo = res ? JSON.parse(res) : null;
      setUserName(userInfo.name ?? "none");

      const today = new Date(); 
      const daysAgo = 7;

      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - daysAgo);

      try {
        const logs = await importLog(
          accessToken,
          refreshToken,
          dispatch,
          setAccessToken,
          setRefreshToken,
          null,
          0,
          100
        );

        // console.log(pastDate.toISOString())
        // console.log(logs)
      
        setTotalItems(logs.count);
      } catch (error: any) {
        console.error("Error fetching import logs:", error);
        if (error.message === "Chưa đăng nhập") {
          if (router.canDismiss()) {
            router.dismissAll();
          }
          router.replace("/login");
          return;
        }
        setTotalItems(0);
      }


      try {
        const logs = await getSaleLogs(
          accessToken,
          refreshToken,
          dispatch,
          setAccessToken,
          setRefreshToken,
          null,
          0,
          1000
        );

        let value = 0
        for (const item of logs.data) {
          value += item.total;
        }
        setRevenue(value)
      } catch (error: any) {
        console.error("Error fetching sale logs:", error);
        if (error.message === "Chưa đăng nhập") {
          if (router.canDismiss()) {
            router.dismissAll();
          }
          router.replace("/login");
          return;
        }
        setRevenue(0);
      }
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
              initial={(userName[0] ?? "n").toUpperCase()}
              onPress={() => console.log("User card tapped")}
            />

            <View style={styles.statsRow}>
              <InfoCard
                value={Revenue + ' đ'}
                label="Total revenue"
                onPress={() => console.log("Revenue card pressed")}
              />

              <InfoCard
                value={totalItems}
                label="New items"
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
                onPress={() => handleFeaturePress("Warehouse")}
              />

              <FeatureItem
                image={require("../../assets/images/import.png")}
                label="Import"
                onPress={() => handleFeaturePress("Import")}
              />
              <FeatureItem
                image={require("../../assets/images/historyicon.png")}
                label="History"
                onPress={() => handleFeaturePress("History")}
              />
              <FeatureItem
                image={require("../../assets/images/scanicon.png")}
                label="Import Log"
                onPress={() => handleFeaturePress("Import Log")}
              />
              <FeatureItem
                image={require("../../assets/images/receipicon.png")}
                label="Receipt"
                onPress={() => handleFeaturePress("Receipt")}
              />
              <FeatureItem
                image={require("../../assets/images/settingicon.png")}
                label="Setting"
                onPress={() => handleFeaturePress("Setting")}
              />
            </View>
            {/* <Button
              title="reset 363"
              onPress={() => {
                AsyncStorage.removeItem("isFirstInstall");
                AsyncStorage.removeItem("userInfo");
                SecureStore.deleteItemAsync("access_token");
                SecureStore.deleteItemAsync("refresh_token");
              }}
            /> */}
          </View>
          {/* <View style={{ marginTop: 50, padding: 10 }}>
            <Button title="Gửi lỗi test lên Sentry" onPress={sendTestError} />
          </View> */}

        </View>
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
});
