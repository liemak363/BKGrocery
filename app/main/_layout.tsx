import React from "react";
import { Tabs, useSegments } from "expo-router";
import BottomNavBar from "@/components/ui/BottomNavBar";
import { View, StyleSheet } from "react-native";

// Interface for the TabBar props
interface CustomTabBarProps {
  state: {
    routes: Array<{
      key: string;
      name: string;
    }>;
    index: number;
  };
  navigation: {
    emit: (event: { type: string; target: string }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string) => void;
  };
}

// Custom TabBar component that uses our BottomNavBar
function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const segments = useSegments();
  
  const onTabPress = (tabKey: string) => {
    // Map tab keys to route names
    let routeName = tabKey;
    if (tabKey === "home") routeName = "index";
    if (tabKey === "history") routeName = "saleLog";

    const event = navigation.emit({
      type: "tabPress",
      target: routeName,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  // Get the active tab key based on the current route
  const getActiveTabKey = () => {
    const routeName = state.routes[state.index].name;
    if (routeName === "index") return "home";
    if (routeName === "importLog") return "importLog";
    return routeName;
  };
  // Hide bottom nav bar for saleLog detail pages
  const shouldHideBottomNav = (segments as string[]).includes('[id]') && (segments as string[]).includes('saleLog');
  
  if (shouldHideBottomNav) {
    return null;
  }

  return <BottomNavBar activeTab={getActiveTabKey()} onTabPress={onTabPress} />;
}

export default function Layout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props: CustomTabBarProps) => (
          <View style={styles.bottomNavContainer}>
            <CustomTabBar {...props} />
          </View>
        )}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="import" options={{ title: "Import" }} />
        <Tabs.Screen name="receipt" options={{ title: "Receipt" }} />
        <Tabs.Screen name="setting" options={{ title: "Setting" }} />
        <Tabs.Screen name="importLog" options={{ title: "ImportLog" }} />
        <Tabs.Screen name="warehouse" options={{ title: "Warehouse" }} />
        <Tabs.Screen name="saleLog" options={{ title: "Sale Log" }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomNavContainer: {
    width: "100%",
    backgroundColor: "#F7FEE7",
  },
});
