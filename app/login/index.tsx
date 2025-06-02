import React, { useState } from "react";
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
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import Header from "@/components/ui/header";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { login } from "@/services/auth";
import { useDispatch } from "react-redux";
import { setUserInfo, setAccessToken } from "@/store/globalReducer";
import { AppDispatch } from "@/store/globalStore";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    // router.replace("/home");
    // console.log("HIHIHI")

    if (!name || !password) {
      setErrorMessage("Vui lòng nhập đủ thông tin");
      return;
    }

    try {
      const res = await login(name, password);

      const userInfo = {
        name: res.name,
        id: res.id,
      };
      dispatch(setUserInfo(userInfo));
      await AsyncStorage.setItem(
        "user_info",
        JSON.stringify({ name: res.name, id: res.id })
      );

      dispatch(setAccessToken(res.access_token));
      await SecureStore.setItemAsync("access_token", res.access_token);

      await SecureStore.setItemAsync("refresh_token", res.refresh_token);

      setErrorMessage("");
      router.replace("/main");

      // alert("Đăng nhập thành công!");
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(
        error.message || "Đăng nhập không thành công, xin thử lại"
      );
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ECFCCB" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Làm trong suốt thanh trạng thái */}
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />
          {/* Header */}
          <Header />
          <View style={styles.body}>
            <Text style={styles.loginTitle}>Đăng nhập</Text>
            {errorMessage ? (
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            ) : null}
            <Text style={styles.label}>Nhập tên đăng nhập</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên đăng nhập"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
              returnKeyType="next"
            />
            <Text style={styles.label}>Nhập mật khẩu</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputbtn}
                placeholder="Mật Khẩu"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                <Ionicons
                  name={passwordVisible ? "eye" : "eye-off"}
                  size={20}
                  color="#000"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.replace("/register")}
            >
              <Text style={styles.registerButtonText}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {/* <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} /> */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ECFCCB",
    // flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50, // Thêm padding bottom để có space cho keyboard
  },
  loginTitle: {
    fontSize: 44,
    fontWeight: "bold",
    color: "#252EFF",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    paddingLeft: 10,
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    flex: 1,
  },
  body: {
    paddingHorizontal: 30,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputbtn: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    flex: 1,
  },
  eyeIcon: {
    position: "absolute",
    padding: 12,
    right: 10,
    top: 0,
  },
  forgotPassword: {
    color: "#60A5FA",
    textAlign: "right",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#6366F1",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  registerButton: {
    backgroundColor: "#16A34A",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  registerButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  errorMessage: {
    color: "red",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
    fontSize: 20,
  },
});
