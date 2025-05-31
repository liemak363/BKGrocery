import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ImportScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Home");
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Example form state
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (showScanner) {
      (async () => {
        // Simulate permission set – remove or replace with real code when needed.
        setHasPermission(true);
      })();
    }
  }, [showScanner]);

  const handleTabPress = (tab: string) => {
    let route: string = "./" + tab;
    router.replace(route as any);
    setActiveTab(tab);
  };

  const handleScanQRCode = () => {
    setShowScanner(true);
  };

  const handleBarCodeScanned = ({ type, data }: any) => {
    setShowScanner(false);
    // Simulate scanning data
    setProductName(data);
  };

  return (
    <View style={styles.container}>
      {/* Modal for QR Scanner */}
      <Modal visible={showScanner} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.scannerContainer}>
            <View style={styles.fakeScannerView}>
              <View style={styles.scannerFrame} />
            </View>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleBarCodeScanned}
            >
              <Text style={styles.scanButtonText}>Simulate Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowScanner(false)}
            >
              <Text style={styles.cancelButtonText}>Huỷ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Nhập vào kho</Text>
        <View style={styles.qrBox}>
          <Ionicons name="qr-code-outline" size={64} color="white" />
        </View>
        <TouchableOpacity style={styles.scanButton} onPress={handleScanQRCode}>
          <Ionicons name="scan" size={18} color="white" />
          <Text style={styles.scanButtonText}>Scan QR Code</Text>
        </TouchableOpacity>

        {/* Example Form */}
        <Text style={styles.label}>NHẬP TÊN SẢN PHẨM</Text>
        <TextInput
          style={styles.input}
          value={productName}
          onChangeText={setProductName}
          placeholder="Hạt nêm"
        />
        <Text style={styles.label}>NHẬP SỐ LƯỢNG</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          placeholder="0"
          keyboardType="numeric"
        />
        <Text style={styles.label}>GIÁ HIỆN TẠI: 30.000</Text>
        <Text style={styles.label}>NHẬP GIÁ</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="Nhập giá"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.textarea}
          value={description}
          onChangeText={setDescription}
          placeholder="Mô tả vị trí để"
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>xác nhận</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1FFD4",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    // Ensure content is aligned at the top
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: "500",
  },
  qrBox: {
    width: 220,
    height: 140,
    backgroundColor: "#222",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C9B1F",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    marginBottom: 20,
  },
  scanButtonText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  label: {
    alignSelf: "flex-start",
    marginLeft: 5,
    marginTop: 10,
    fontWeight: "bold",
    color: "#222",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#4D7C0F",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  textarea: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#4D7C0F",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    minHeight: 60,
    textAlignVertical: "top",
  },
  confirmButton: {
    backgroundColor: "#2C9B1F",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Modal and scanner styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  scannerContainer: {
    backgroundColor: "#222",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: 300,
    height: 350,
    justifyContent: "center",
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: "#DC2626",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  fakeScannerView: {
    width: 260,
    height: 180,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 20,
  },
  scannerFrame: {
    width: 160,
    height: 160,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 8,
  },
});
