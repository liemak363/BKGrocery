import {
  View,
  Text,
  Button,
  StatusBar,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Image,
  FlatList,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import React, { useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Header from "@/components/ui/header";
import { jwtDecode } from "jwt-decode";
import * as SecureStore from "expo-secure-store";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    key: "1",
    description: "Ứng dụng quản lý hàng hóa bằng mã vạch tiện lợi",
    image: require("../../assets/images/onbroading1.png"),
  },
  {
    key: "2",
    description:
      "Ứng dụng còn giúp nhập hàng tiện lợi và theo dõi kho chính xác",
    image: require("../../assets/images/onbroading2.png"),
  },
  {
    key: "3",
    description: "Tính tiền dễ dàng, không sai sót",
    image: require("../../assets/images/onbroading3.png"),
  },
  {
    key: "4",
    description: "Cùng khám phá ứng dụng",
    image: require("../../assets/images/onbroading4.png"),
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await AsyncStorage.setItem("isFirstInstall", "false");
      router.replace("/login");
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }: { item: (typeof slides)[0] }) => (
    <View style={styles.slides}>
      <Image source={item.image} />
      <Text style={styles.subtitle}>{item.description}</Text>
    </View>
  );
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <Header />
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
      <TouchableOpacity onPress={handleNext} style={styles.button}>
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? " Bắt đầu " : "Tiếp theo"}
        </Text>
      </TouchableOpacity>
      <View style={styles.indicator}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={{
              height: 8,
              width: 8,
              borderRadius: 4,
              backgroundColor: currentIndex === index ? "#4caf50" : "#c8e6c9",
              margin: 4,
              marginBottom: 40,
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5fddc" },
  header: { height: height * 0.2 },
  banner: {
    width: width,
    height: height * 0.2,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    paddingTop: StatusBar.currentHeight,
  },
  title: {
    fontSize: 36,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#365314",
    textAlign: "center",
  },
  slides: { width, padding: 20, alignItems: "center", marginTop: 20 },
  indicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#4caf50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 40,
  },
  buttonText: { color: "white", fontWeight: "bold" },
});
