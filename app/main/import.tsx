import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  StatusBar,
  Alert,
  Dimensions,
  AppState,
  ActivityIndicator,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useCameraPermissions, CameraView } from "expo-camera";

import { AppDispatch, RootState } from "@/store/globalStore";
import { setAccessToken, setRefreshToken } from "@/store/globalReducer";
import { useDispatch, useSelector } from "react-redux";

import { productById } from "@/services/product";
import { importProduct } from "@/services/import";

import { ImportProductType } from "@/types/Import";
import ProductType from "@/types/Product";

const { width } = Dimensions.get("window");

export default function ImportScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken, refreshToken } = useSelector(
    (state: RootState) => state.global
  );

  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  // Camera and scanning states
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const appStateRef = useRef(AppState.currentState);

  // Product states
  const [scannedProductId, setScannedProductId] = useState("");
  const [foundProduct, setFoundProduct] = useState<ProductType | null>(null);
  const [isExistingProduct, setIsExistingProduct] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [productNotFound, setProductNotFound] = useState<string | null>(null);

  // Form states
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  // Success/Error states
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  // Camera management functions
  const resetCamera = () => {
    if (permission?.granted) {
      setIsScanning(true);
      setCameraActive(true);
    }
  };

  const stopCamera = () => {
    setIsScanning(false);
    setCameraActive(false);
  };

  // Search for product by ID
  const searchProduct = async (productId: string) => {
    if (!productId.trim()) return;

    setProductNotFound(null);
    setIsLoading(true);
    setFoundProduct(null);
    setIsExistingProduct(false);

    try {
      const product = await productById(
        productId,
        accessToken,
        refreshToken,
        dispatch,
        setAccessToken,
        setRefreshToken
      );
      console.log("Found product:", product);

      // Product found - populate form with existing data
      setFoundProduct(product);
      setIsExistingProduct(true);
      setProductName(product.name);
      setPrice(product.price.toString());
      setDescription(product.description || "");
    } catch (error: any) {
      if (error.message === "Chưa đăng nhập") {
        if (router.canDismiss()) {
          router.dismiss();
        }
        router.replace("/login");
        return;
      }

      if (error.message == "Sản phẩm không tồn tại") {
        // Product not found - this is a new product
        setProductNotFound(`Sản phẩm mới với mã: ${productId}`);
        setIsExistingProduct(false);
        setFoundProduct(null);
        // Clear form for new product
        setProductName("");
        setPrice("");
        setDescription("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle barcode scan
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!isScanning) return;

    setIsScanning(false);
    setShowScanner(false);
    setScannedProductId(data);
    searchProduct(data);
  };

  // Handle import product
  const handleImportProduct = async () => {
    if (isExistingProduct) {
      // Existing product - validate required fields
      const finalName = productName.trim() || foundProduct?.name;
      const finalPrice = price.trim() ? parseFloat(price) : foundProduct?.price;
      const finalQuantity = quantity.trim() ? parseInt(quantity) : 0;

      if (!finalName || !finalPrice) {
        Alert.alert("Lỗi", "Tên sản phẩm và giá không được để trống");
        return;
      }

      const importData: ImportProductType = {
        productId: scannedProductId,
        name: finalName,
        price: finalPrice,
        quantity: finalQuantity,
        createdAt: new Date().toISOString(),
      };
      if (description.trim()) {
        importData.description = description.trim();
      }

      await submitImport(importData);
    } else {
      // New product - all fields required
      if (!productName.trim() || !price.trim()) {
        Alert.alert("Lỗi", "Tên sản phẩm và giá là bắt buộc cho sản phẩm mới");
        return;
      }

      const finalQuantity = quantity.trim() ? parseInt(quantity) : 0;
      const finalPrice = parseFloat(price);

      if (isNaN(finalPrice) || finalPrice <= 0) {
        Alert.alert("Lỗi", "Vui lòng nhập giá hợp lệ");
        return;
      }

      if (quantity.trim() && (isNaN(finalQuantity) || finalQuantity < 0)) {
        Alert.alert("Lỗi", "Vui lòng nhập số lượng hợp lệ");
        return;
      }

      const importData: ImportProductType = {
        productId: scannedProductId || new Date().getTime().toString(), // Generate ID if no scan
        name: productName.trim(),
        price: finalPrice,
        quantity: finalQuantity,
        // description: description.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      if (description.trim()) {
        importData.description = description.trim();
      }

      await submitImport(importData);
    }
  };

  // Submit import to server
  const submitImport = async (importData: ImportProductType) => {
    setIsLoading(true);
    try {
      await importProduct(
        importData,
        accessToken,
        refreshToken,
        dispatch,
        setAccessToken,
        setRefreshToken
      );

      setNotificationMessage("Nhập kho thành công!");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);

      // Reset form
      resetForm();
    } catch (error: any) {
      console.error("Error importing product:", error);
      Alert.alert("Lỗi", error.message || "Không thể nhập kho");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setScannedProductId("");
    setFoundProduct(null);
    setIsExistingProduct(false);
    setProductName("");
    setQuantity("");
    setPrice("");
    setDescription("");
    setProductNotFound(null);
  };

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      appStateRef.current = nextAppState;
      setAppState(nextAppState);

      if (nextAppState === "active" && showScanner && permission?.granted) {
        resetCamera();
      } else if (nextAppState !== "active") {
        stopCamera();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [showScanner, permission?.granted]);

  // Reset camera when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (showScanner && permission?.granted) {
        resetCamera();
      }

      return () => {
        stopCamera();
      };
    }, [showScanner, permission?.granted])
  );

  // Handle scanner modal changes
  useEffect(() => {
    if (showScanner && permission?.granted) {
      resetCamera();
    } else {
      stopCamera();
    }
  }, [showScanner, permission?.granted]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ECFCCB" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.container}>
          <StatusBar
            barStyle="light-content"
            backgroundColor="#4D7C0F"
            translucent
          />

          {/* Success Notification */}
          {showNotification && (
            <View style={styles.notification}>
              <Text style={styles.notificationText}>{notificationMessage}</Text>
            </View>
          )}

          {/* Camera Scanner Modal */}
          <Modal
            visible={showScanner}
            animationType="slide"
            transparent={false}
          >
            <View style={styles.scannerModalContainer}>
              <StatusBar barStyle="light-content" backgroundColor="#000" />

              {permission?.granted ? (
                <View style={styles.cameraContainer}>
                  {cameraActive && (
                    <CameraView
                      style={styles.camera}
                      facing="back"
                      onBarcodeScanned={
                        isScanning ? handleBarCodeScanned : undefined
                      }
                      barcodeScannerSettings={{
                        barcodeTypes: [
                          "code128",
                          "code39",
                          "code93",
                          "ean13",
                          "ean8",
                        ],
                      }}
                    />
                  )}

                  <View style={styles.scannerOverlay}>
                    <View style={styles.scannerFrame} />
                    <Text style={styles.scannerText}>
                      Đưa mã barcode vào khung để quét
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.closeScannerButton}
                    onPress={() => setShowScanner(false)}
                  >
                    <Ionicons name="close" size={30} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.permissionContainer}>
                  <Text style={styles.permissionText}>
                    Cần quyền truy cập camera để quét mã
                  </Text>
                  <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={requestPermission}
                  >
                    <Text style={styles.permissionButtonText}>Cấp quyền</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowScanner(false)}
                  >
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Modal>

          {/* Main Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Nhập vào kho</Text>
            {/* QR Scanner Button */}
            <View style={styles.qrBox}>
              <Ionicons name="qr-code-outline" size={64} color="white" />
            </View>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => setShowScanner(true)}
              disabled={isLoading}
            >
              <Ionicons name="scan" size={18} color="white" />
              <Text style={styles.scanButtonText}>Quét mã sản phẩm</Text>
            </TouchableOpacity>
            {/* Manual Product ID Input */}
            <View style={styles.manualInputContainer}>
              <Text style={styles.label}>HOẶC NHẬP MÃ SẢN PHẨM THỦ CÔNG</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={scannedProductId}
                  onChangeText={setScannedProductId}
                  placeholder="Nhập mã sản phẩm"
                  returnKeyType="search"
                  onSubmitEditing={() => searchProduct(scannedProductId)}
                />
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() => searchProduct(scannedProductId)}
                  disabled={isLoading || !scannedProductId.trim()}
                >
                  <Ionicons name="search" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            {/* Loading Indicator */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2C9B1F" />
                <Text style={styles.loadingText}>Đang xử lý...</Text>
              </View>
            )}
            {/* Product Not Found */}
            {productNotFound && (
              <View style={styles.statusContainer}>
                <Text style={styles.newProductText}>{productNotFound}</Text>
              </View>
            )}
            {/* Found Product Info */}
            {foundProduct && (
              <View style={styles.statusContainer}>
                <Text style={styles.foundProductText}>
                  Tìm thấy sản phẩm: {foundProduct.name}
                </Text>
                <Text style={styles.foundProductSubText}>
                  Giá hiện tại: {foundProduct.price.toLocaleString("vi-VN")} ₫
                </Text>
              </View>
            )}
            {/* Product Form */}
            {(foundProduct || productNotFound) && (
              <>
                <Text style={styles.label}>
                  {isExistingProduct ? "TÊN HIỆN TẠI:" : "NHẬP TÊN SẢN PHẨM"}
                  {isExistingProduct && foundProduct && ` ${foundProduct.name}`}
                </Text>
                <TextInput
                  style={styles.input}
                  value={productName}
                  onChangeText={setProductName}
                  placeholder={
                    isExistingProduct
                      ? "Để trống nếu không thay đổi"
                      : "Tên sản phẩm (bắt buộc)"
                  }
                  returnKeyType="next"
                />
                <Text style={styles.label}>NHẬP SỐ LƯỢNG</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="0 (để trống nếu chỉ cập nhật giá)"
                  keyboardType="numeric"
                  returnKeyType="next"
                />
                <Text style={styles.label}>
                  {isExistingProduct ? "GIÁ HIỆN TẠI:" : "NHẬP GIÁ"}
                  {isExistingProduct &&
                    foundProduct &&
                    ` ${foundProduct.price.toLocaleString("vi-VN")} ₫`}
                </Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder={
                    isExistingProduct
                      ? "Để trống nếu không thay đổi"
                      : "Giá (bắt buộc)"
                  }
                  keyboardType="numeric"
                  returnKeyType="next"
                />
                <Text style={styles.label}>MÔ TẢ VỊ TRÍ</Text>
                <TextInput
                  style={styles.textarea}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Mô tả vị trí để sản phẩm"
                  multiline
                  numberOfLines={3}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    isLoading && styles.confirmButtonDisabled,
                  ]}
                  onPress={handleImportProduct}
                  disabled={isLoading}
                >
                  <Text style={styles.confirmButtonText}>
                    {isLoading ? "Đang xử lý..." : "Xác nhận nhập kho"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={resetForm}
                >
                  <Text style={styles.resetButtonText}>Làm mới</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECFCCB",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingBottom: 50,
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
  confirmButtonDisabled: {
    backgroundColor: "#A5A5A5",
  },
  resetButton: {
    backgroundColor: "#DC2626",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Camera Modal Styles
  scannerModalContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 8,
    marginBottom: 20,
  },
  scannerText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  closeScannerButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 25,
    padding: 10,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  permissionText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: "#2C9B1F",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 10,
  },
  permissionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Manual Input Styles
  manualInputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchButton: {
    backgroundColor: "#2C9B1F",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  // Status Styles
  notification: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    zIndex: 1000,
    elevation: 10,
  },
  notificationText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  statusContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: "100%",
    borderLeftWidth: 4,
    borderLeftColor: "#2C9B1F",
  },
  foundProductText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C9B1F",
    marginBottom: 5,
  },
  foundProductSubText: {
    fontSize: 14,
    color: "#666",
  },
  newProductText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF9800",
  },
});
