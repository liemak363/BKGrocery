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
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import Header from "@/components/ui/header";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const handleLogin = async () => {
    router.replace("/home");
    console.log("HIHIHI")

    if (!email || !password) {
      setErrorMessage("Vui lòng nhập đủ thông tin");
      return;
    }

    try {
      const res = await fetch('https://bkgrocery-be.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: email,
          password: password,
        }),
      });

      if(res.status == 403) {
        setErrorMessage("Tài khoản hoặc mật khẩu không đúng!");
        return;
      }

      if (!res.ok) {
        setErrorMessage("Đăng nhập không thành công, xin thử lại");
        return;
      }

      const data = await res.json();
      console.log('Login response:', data);

      AsyncStorage.setItem("user_name", data.name)
      await SecureStore.setItemAsync("access_token", data.access_token);

      setErrorMessage("");
      router.replace("/home");
      // alert("Đăng nhập thành công!");
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    }
  }

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

        <View style={styles.body}>
            <Text style={styles.loginTitle}>Đăng nhập</Text>
            {errorMessage ? (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
            ) : null}

            <Text style={styles.label}>Nhập email</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Email" 
                placeholderTextColor="#888"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail} 
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
                />
                <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setPasswordVisible(!passwordVisible)}
                >
                    <Ionicons name={passwordVisible ? "eye" : "eye-off"} size={20} color="#000" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ECFCCB",
    // flex: 1,
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

