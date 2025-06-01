import React from "react";
import { Stack } from "expo-router";

export default function SaleLogLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // We handle our own headers
        animationDuration: 150, // Very fast animation
        animationTypeForReplace: "push", // Smooth replace animation
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Lịch sử bán hàng",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Chi tiết đơn hàng",
        }}
      />
    </Stack>
  );
}
