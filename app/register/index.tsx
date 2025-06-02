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
import { signup } from "@/services/auth";

export default function RegisterScreen() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfimPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessage2, setErrorMessage2] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const handleLogin = async () => {
    setSuccessMessage("");
    if (!username || !password || !confirmPassword) {
      setErrorMessage2("");
      setErrorMessage("Vui lòng nhập đủ thông tin");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("");
      setErrorMessage2("Mật khẩu không khớp");
      return;
    }

    try {
      const res = await signup(username, password);
      if (res.error) {
        setErrorMessage(res.error);
        return;
      }
    } catch (error) {
      console.error("Đăng ký thất bại:", error);
      if (error instanceof Error && error.message == "Tài khoản đã tồn tại!") {
        setErrorMessage("Tài khoản đã tồn tại!");
        return;
      }
      setErrorMessage("Đăng ký thất bại. Vui lòng thử lại sau.");
      return;
    }

    setUsername("");
    setPassword("");
    setConfimPassword("");
    setConfirmPasswordVisible(false);

    setErrorMessage("");
    setErrorMessage2("");
    setSuccessMessage("Đăng ký thành công");
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
            <Text style={styles.loginTitle}>Đăng ký</Text>
            {errorMessage ? (
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            ) : null}
            {successMessage ? (
              <Text style={styles.successMessage}>{successMessage}</Text>
            ) : null}
            <Text style={styles.label}>Nhập tên đăng nhập</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên đăng nhập"
              placeholderTextColor="#888"
              value={username}
              onChangeText={setUsername}
              returnKeyType="next"
            />
            {errorMessage2 ? (
              <Text style={styles.errorMessage}>{errorMessage2}</Text>
            ) : null}
            <Text style={styles.label}>Nhập mật khẩu</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputbtn}
                placeholder="Mật Khẩu"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                returnKeyType="next"
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
            <Text style={styles.label}>Nhập lại mật khẩu</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputbtn}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#888"
                value={confirmPassword}
                onChangeText={setConfimPassword}
                secureTextEntry={!confirmPasswordVisible}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                }
              >
                <Ionicons
                  name={confirmPasswordVisible ? "eye" : "eye-off"}
                  size={20}
                  color="#000"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Đăng ký</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.replace("/login")}
            >
              <Text style={styles.registerButtonText}>
                Đã có tài khoản - Đăng nhập
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ECFCCB",
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
    marginBottom: 20,
    marginTop: 20,
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
  successMessage: {
    color: "#137E30",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
    fontSize: 20,
  },
});
