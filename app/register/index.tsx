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




export default function RegisterScreen() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfimPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessage2, setErrorMessage2] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const handleLogin = () => {
    setSuccessMessage("")
    if (!fullName || !email || !password || !confirmPassword) {
        setErrorMessage2("");
        setErrorMessage("Vui lòng nhập đủ thông tin");
        return;
    }

    if (password !== confirmPassword) {
        setErrorMessage("");
        setErrorMessage2("Mật khẩu không khớp");
        return;
    }
    setErrorMessage("");
    setSuccessMessage("Đăng ký thành công")
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
            <Text style={styles.loginTitle}>Đăng ký</Text>
            {errorMessage ? (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
            ) : null}

            {successMessage ? (
                <Text style={styles.successMessage}>{successMessage}</Text>
            ) : null}

            <Text style={styles.label}>Nhập Họ và Tên</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Họ và Tên" 
                placeholderTextColor="#888"
                value={fullName}
                onChangeText={setFullName} 
            />

            <Text style={styles.label}>Nhập email</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Email" 
                placeholderTextColor="#888"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail} 
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
                />
                <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setPasswordVisible(!passwordVisible)}
                >
                    <Ionicons name={passwordVisible ? "eye" : "eye-off"} size={20} color="#000" />
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
                />
                <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                >
                    <Ionicons name={confirmPasswordVisible ? "eye" : "eye-off"} size={20} color="#000" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.registerButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Đăng ký</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => router.replace("/login")}
            >
                <Text style={styles.registerButtonText}>Đã có tài khoản - Đăng nhập</Text>
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

