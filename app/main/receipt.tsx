import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  StatusBar,
  ScrollView,
  TextInput,
  AppState,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

import UserInfoCard from "@/components/ui/UserInfo";
import { AppDispatch, RootState } from "@/store/globalStore";
import { setAccessToken, setRefreshToken } from "@/store/globalReducer";

import ProductType from "@/types/Product";
import { SaleLogPost, SaleLogItemPost } from "@/types/SaleLog";
import { productById, productByName } from "@/services/product";
import { postSale } from "@/services/sale";

import { CameraView, useCameraPermissions, Camera } from "expo-camera";
import { configureStore } from "@reduxjs/toolkit";

const { width } = Dimensions.get("window");
const paddingConst = 16; // padding for the FlatList container

const pages = [
  { key: "1", title: "Quét QR Code" },
  { key: "2", title: "Nhập sản phẩm" },
];

export default function Explore() {
  const { userInfo, accessToken, refreshToken } = useSelector(
    (state: RootState) => state.global
  );

  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const appStateRef = useRef(AppState.currentState);
  // cho don thanh toan
  const [sanPhamNhap, setSanPhamNhap] = useState(""); // Input for product name (name search) or ID (QR scan)
  const [soLuongNhap, setSoLuongNhap] = useState("");
  const [sanPhamTimDuoc, setSanPhamTimDuoc] = useState<ProductType | null>(
    null
  );
  const [sanPhamKoTimDuoc, setSanPhamKoTimDuoc] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [donHang, setDonHang] = useState<SaleLogItemPost[]>([]);
  const [saleLog, setSaleLog] = useState<SaleLogPost>({
    createdAt: "",
    items: [],
  });
  const [thongBao, setThongBao] = useState("");
  const [hienThongBao, setHienThongBao] = useState(false);

  // State for name search
  const [searchResults, setSearchResults] = useState<ProductType[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false); // Specific loading for name search

  // State for selected tab index
  const [selectedIndex, setSelectedIndex] = useState(0);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Debounced search for product by name (for "Nhập sản phẩm" tab)
  useEffect(() => {
    const searchName = sanPhamNhap.trim();
    // Only search if on "Nhập sản phẩm" tab (selectedIndex === 1), input is long enough, and no product is currently selected
    if (searchName.length < 2 || selectedIndex !== 1 || sanPhamTimDuoc) {
      setSearchResults([]);
      setIsDropdownVisible(false);
      // Don't clear sanPhamKoTimDuoc here as it might be from other actions or deliberately set
      return;
    }

    const handler = setTimeout(async () => {
      // Re-check conditions inside timeout, as state might change rapidly
      if (
        sanPhamNhap.trim().length >= 2 &&
        selectedIndex === 1 &&
        !sanPhamTimDuoc
      ) {
        setIsLoadingSearch(true);
        setSanPhamKoTimDuoc(null); // Clear previous messages
        setSearchResults([]); // Clear previous results
        setIsDropdownVisible(false); // Hide dropdown until new results

        try {
          const products = await productByName(
            sanPhamNhap.trim(),
            accessToken,
            refreshToken,
            dispatch,
            setAccessToken,
            setRefreshToken
          );
          setSearchResults(products);
          if (products.length > 0) {
            setIsDropdownVisible(true);
            setSanPhamKoTimDuoc(null); // Clear "not found" if products are found
          } else {
            setIsDropdownVisible(false);
            setSanPhamKoTimDuoc(
              `Không tìm thấy sản phẩm nào với tên: "${sanPhamNhap.trim()}"`
            );
          }
        } catch (error: any) {
          console.error("Error fetching product by name:", error);
          setSearchResults([]);
          setIsDropdownVisible(false);
          if (error.message === "Chưa đăng nhập") {
            if (router.canDismiss()) {
              router.dismissAll();
            }
            router.replace("/login");
            return;
          }
          setSanPhamKoTimDuoc(
            error.message ||
              `Lỗi khi tìm sản phẩm với tên: "${sanPhamNhap.trim()}"`
          );
        } finally {
          setIsLoadingSearch(false);
        }
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [
    sanPhamNhap,
    selectedIndex,
    accessToken,
    refreshToken,
    dispatch,
    sanPhamTimDuoc,
  ]);

  // Handler for product name input changes (on "Nhập sản phẩm" tab)
  const handleProductNameInputChange = (text: string) => {
    setSanPhamNhap(text);
    // If a product was selected, and user types something different, clear the selection
    if (sanPhamTimDuoc && text.trim() !== sanPhamTimDuoc.name) {
      setSanPhamTimDuoc(null);
      setSoLuongNhap("");
      setSanPhamKoTimDuoc(null); // Clear message, new search will be triggered by useEffect
    } else if (!sanPhamTimDuoc && text.trim().length < 2) {
      // If no product selected and text is too short for search
      setSearchResults([]);
      setIsDropdownVisible(false);
      if (!text.trim()) {
        // If input is completely empty
        setSanPhamKoTimDuoc(null); // Clear any "not found by name" message
      }
    }
  };

  // Search product by ID (for QR Scan tab)
  const timSanPham = async (productId: string) => {
    setSanPhamKoTimDuoc(null); // Clear any previous message
    setIsLoading(true); // Use generic loading state

    // Clear name search specific states
    setSearchResults([]);
    setIsDropdownVisible(false);
    // sanPhamNhap will be updated to product name on success, or retain productId on failure.

    try {
      const product = await productById(
        productId,
        accessToken,
        refreshToken,
        dispatch,
        setAccessToken,
        setRefreshToken
      );
      setSanPhamTimDuoc(product);
      setSanPhamNhap(product.name); // Update input to show found product's name
      setSoLuongNhap(""); // Reset quantity input for the new product
    } catch (error: any) {
      console.error("Error fetching product by ID:", error);
      setSanPhamTimDuoc(null);
      if (error.message === "Chưa đăng nhập") {
        if (router.canDismiss()) {
          router.dismissAll();
        }
        router.replace("/login");
        return;
      }
      setSanPhamKoTimDuoc(
        error.message || `Không tìm thấy sản phẩm với mã: ${productId}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for selecting a product from the name search dropdown
  const handleSelectProductFromDropdown = (product: ProductType) => {
    setSanPhamTimDuoc(product);
    setSanPhamNhap(product.name); // Update input to reflect selection
    setIsDropdownVisible(false);
    setSearchResults([]);
    setSoLuongNhap(""); // Reset quantity for the new product
    setSanPhamKoTimDuoc(null); // Clear any "not found" messages
    // Consider Keyboard.dismiss();
  };

  const themSanPham = () => {
    if (!sanPhamTimDuoc) return;

    setErrorMessage(null);
    const quantity = parseInt(soLuongNhap);

    if (isNaN(quantity) || quantity <= 0) {
      setErrorMessage("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    // Check if product already exists in the order
    const existingItemIndex = donHang.findIndex(
      (item) => item.productId === sanPhamTimDuoc.id
    );

    let updatedItems: SaleLogItemPost[];

    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      updatedItems = [...donHang];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
      };
    } else {
      // Add new product to order
      const newItem: SaleLogItemPost = {
        productId: sanPhamTimDuoc.id.toString(),
        price: sanPhamTimDuoc.price,
        quantity: quantity,
        name: sanPhamTimDuoc.name,
      };
      updatedItems = [...donHang, newItem];
    }

    // Update state
    setDonHang(updatedItems);

    // Update the SaleLog
    setSaleLog({
      ...saleLog,
      items: updatedItems,
      total: updatedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    });

    // Reset product input fields
    setSanPhamTimDuoc(null);
    setSanPhamNhap("");
    setSoLuongNhap("");
  };
  const xacNhanDonHang = async () => {
    if (donHang.length === 0) {
      setThongBao("Không có sản phẩm nào trong đơn hàng");
      setHienThongBao(true);
      setTimeout(() => setHienThongBao(false), 3000);
      return;
    }

    setIsLoading(true);

    try {
      console.log("Submitting order:", JSON.stringify(saleLog));

      const copySaleLog = {
        ...saleLog,
        createdAt: new Date().toISOString(),
      };
      let response;
      try {
        response = await postSale(
          copySaleLog,
          accessToken,
          refreshToken,
          dispatch,
          setAccessToken,
          setRefreshToken
        );
      } catch (error: any) {
        if (error.message === "Chưa đăng nhập") {
          if (router.canDismiss()) {
            router.dismissAll();
          }
          router.replace("/login");
          return;
        }
        throw error;
      }

      // Reset the order
      setDonHang([]);
      setSaleLog({
        createdAt: "",
        items: [],
        total: 0,
      });

      // Show success message
      setThongBao("Đã ghi nhận đơn hàng thành công");
      setHienThongBao(true);
      setTimeout(() => setHienThongBao(false), 3000);
    } catch (error: any) {
      console.error("Error submitting order:", error);
      setThongBao(
        "Lỗi khi gửi đơn hàng: " + (error.message || "Đã xảy ra lỗi")
      );
      setHienThongBao(true);
      setTimeout(() => setHienThongBao(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const huyDonHang = () => {
    setDonHang([]);
    setSaleLog({
      createdAt: "",
      items: [],
      total: 0,
    });
    setSanPhamNhap("");
    setSoLuongNhap("");
    setSanPhamTimDuoc(null);
    setSanPhamKoTimDuoc(null);
    setErrorMessage(null);
    // Clear name search state as well
    setSearchResults([]);
    setIsDropdownVisible(false);
  };

  const tongTien = donHang.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );

  // hiệu ứng
  // const dispatch = useDispatch<AppDispatch>(); // Already defined above
  // const router = useRouter(); // Already defined above

  const [activeTab, setActiveTab] = useState("Home");
  const [userName, setUserName] = useState("none");

  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const tabWidth = width / pages.length;
  const onViewRef = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const index = viewableItems[0].index ?? 0;
      setSelectedIndex(index);

      // Activate camera if user switched to scan tab
      if (index === 0 && permission?.granted) {
        resetCamera();
      } else {
        stopCamera();
      }
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

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

  // Handle tab switching
  useEffect(() => {
    if (selectedIndex === 0 && permission?.granted) {
      // Reset camera when switching to scan tab
      resetCamera();
    } else {
      // Turn off camera when not on scan tab
      stopCamera();
    }
  }, [selectedIndex, permission?.granted]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      appStateRef.current = nextAppState;
      setAppState(nextAppState);

      if (
        nextAppState === "active" &&
        selectedIndex === 0 &&
        permission?.granted
      ) {
        // App came to foreground and we're on the scan tab
        resetCamera();
      } else if (nextAppState !== "active") {
        // App went to background
        stopCamera();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [selectedIndex, permission?.granted]);

  // Reset camera when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (selectedIndex === 0 && permission?.granted) {
        resetCamera();
      }

      return () => {
        // Clean up when screen loses focus
        stopCamera();
      };
    }, [selectedIndex, permission?.granted])
  );

  const scrollToIndex = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index });
    }
  };
  const renderItem = ({ item }: { item: { key: string; title: string } }) => (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 10,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {/* <Text style={styles.pageTitle}>{item.title}</Text> */}
      {item.key === "1" ? (
        <View style={styles.subcontainer1}>
          {hienThongBao && (
            <View style={styles.modalThongBao}>
              <Text style={styles.thongBaoText}>{thongBao}</Text>
              <TouchableOpacity
                onPress={() => setHienThongBao(false)}
                style={styles.continueBtn}
              >
                <Text style={{ color: "white" }}>Tiếp tục</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* <Text style={styles.label}>NHẬP TÊN SẢN PHẨM</Text> */}
          {/* thay đổi bằng cái quét */}
          {/* <TextInput
            style={styles.input}
            value={sanPhamNhap}
            onChangeText={setSanPhamNhap}            onSubmitEditing={() => timSanPham(sanPhamNhap)}
            placeholder="Tên sản phẩm"
          /> */}
          {/* end */}
          <View
            style={{
              width: "100%",
              height: 300,
              marginBottom: 10,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {permission?.granted ? (
              cameraActive ? (
                <CameraView
                  style={{ flex: 1 }}
                  facing="back"
                  barcodeScannerSettings={{
                    barcodeTypes: ["ean13"], // chỉ quét QR
                  }}
                  onBarcodeScanned={({ data }) => {
                    console.log("Scanned data:", data);
                    if (isScanning) {
                      setIsScanning(false); // tránh quét nhiều lần
                      timSanPham(data); // gọi hàm tìm bằng ID
                      setTimeout(() => setIsScanning(true), 3000); // cho phép quét lại sau 3s
                    }
                  }}
                />
              ) : (
                <TouchableOpacity
                  onPress={resetCamera}
                  style={styles.confirmBtn}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Bật Camera
                  </Text>
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                onPress={requestPermission}
                style={styles.confirmBtn}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  Cho phép truy cập Camera
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {sanPhamKoTimDuoc &&
            !sanPhamTimDuoc && ( // Show if message exists and no product is selected
              <Text style={styles.errorMessage}>{sanPhamKoTimDuoc}</Text>
            )}
          {sanPhamTimDuoc && (
            <View style={styles.popup}>
              <Text>TÊN SẢN PHẨM: {sanPhamTimDuoc.name}</Text>
              <Text>ĐƠN GIÁ: {sanPhamTimDuoc.price.toLocaleString()} VND</Text>
              <Text>NHẬP SỐ LƯỢNG</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={soLuongNhap}
                onChangeText={setSoLuongNhap}
                placeholder="Nhập số lượng"
                returnKeyType="done"
                onSubmitEditing={themSanPham}
              />
              {errorMessage && (
                <Text
                  style={{
                    color: "red",
                    marginTop: 5,
                    textAlign: "center",
                    fontSize: 16,
                  }}
                >
                  {errorMessage}
                </Text>
              )}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setSanPhamTimDuoc(null);
                    setSanPhamNhap("");
                    setSoLuongNhap("");
                  }}
                >
                  <Text style={styles.whiteText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={themSanPham}>
                  <Text style={styles.whiteText}>Thêm</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          <Text style={styles.title}>ĐƠN THANH TOÁN</Text>
          <View style={styles.table}>
            <View style={styles.row}>
              <Text style={styles.cellHeader}>Tên sản phẩm</Text>
              <Text style={styles.cellHeader}>Số lượng</Text>
              <Text style={styles.cellHeader}>Giá</Text>
            </View>
            {donHang.map((item, index) => (
              <View style={styles.row} key={index}>
                <Text style={styles.cell}>{item.name}</Text>
                <Text style={styles.cell}>{item.quantity}</Text>
                <Text style={styles.cell}>
                  {(item.quantity * item.price).toLocaleString()}vnd
                </Text>
              </View>
            ))}
            <View style={styles.row}>
              <Text style={styles.cell}>Tổng</Text>
              <Text style={styles.cell}></Text>
              <Text style={styles.cell}>{tongTien.toLocaleString()}vnd</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <TouchableOpacity
              style={styles.cancelReceiptBtn}
              onPress={huyDonHang}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                HỦY
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={xacNhanDonHang}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                XÁC NHẬN
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.subcontainer1}>
          {hienThongBao && (
            <View style={styles.modalThongBao}>
              <Text style={styles.thongBaoText}>{thongBao}</Text>
              <TouchableOpacity
                onPress={() => setHienThongBao(false)}
                style={styles.continueBtn}
              >
                <Text style={{ color: "white" }}>Tiếp tục</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.label}>NHẬP TÊN SẢN PHẨM</Text>
          <TextInput
            style={styles.input}
            value={sanPhamNhap}
            onChangeText={handleProductNameInputChange} // Use the new handler
            placeholder="Nhập tên sản phẩm (ít nhất 2 ký tự)"
            returnKeyType="search"
            // onSubmitEditing is not needed as search is debounced via useEffect
          />

          {isLoadingSearch && (
            <ActivityIndicator
              size="small"
              color="#4D7C0F"
              style={{ marginVertical: 5 }}
            />
          )}

          {isDropdownVisible && searchResults.length > 0 && (
            <View style={styles.dropdownContainer}>
              <FlatList
                data={searchResults}
                keyExtractor={(p) => p.id.toString()}
                renderItem={({ item: productItem }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleSelectProductFromDropdown(productItem)}
                  >
                    <Text style={styles.dropdownItemText}>
                      {productItem.name}
                    </Text>
                    <Text style={styles.dropdownItemPrice}>
                      {productItem.price.toLocaleString()} VND
                    </Text>
                  </TouchableOpacity>
                )}
                style={styles.dropdownList}
                keyboardShouldPersistTaps="handled" // Important for press events in ScrollView/FlatList
              />
            </View>
          )}

          {/* Show "not found" message if it exists, dropdown is not visible, and no product is selected */}
          {sanPhamKoTimDuoc && !isDropdownVisible && !sanPhamTimDuoc && (
            <Text style={styles.errorMessage}>{sanPhamKoTimDuoc}</Text>
          )}

          {/* Product details and quantity input (shown when sanPhamTimDuoc is set) */}
          {sanPhamTimDuoc && (
            <View style={styles.popup}>
              <Text>TÊN SẢN PHẨM: {sanPhamTimDuoc.name}</Text>
              <Text>ĐƠN GIÁ: {sanPhamTimDuoc.price.toLocaleString()} VND</Text>
              <Text>NHẬP SỐ LƯỢNG</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={soLuongNhap}
                onChangeText={setSoLuongNhap}
                placeholder="Nhập số lượng"
                returnKeyType="done"
                onSubmitEditing={themSanPham}
              />
              {errorMessage && (
                <Text
                  style={{
                    color: "red",
                    marginTop: 5,
                    textAlign: "center",
                    fontSize: 16,
                  }}
                >
                  {errorMessage}
                </Text>
              )}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setSanPhamTimDuoc(null);
                    setSanPhamNhap("");
                    setSoLuongNhap("");
                  }}
                >
                  <Text style={styles.whiteText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={themSanPham}>
                  <Text style={styles.whiteText}>Thêm</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          <Text style={styles.title}>ĐƠN THANH TOÁN</Text>
          <View style={styles.table}>
            <View style={styles.row}>
              <Text style={styles.cellHeader}>Tên sản phẩm</Text>
              <Text style={styles.cellHeader}>Số lượng</Text>
              <Text style={styles.cellHeader}>Giá</Text>
            </View>
            {donHang.map((item, index) => (
              <View style={styles.row} key={index}>
                <Text style={styles.cell}>{item.name}</Text>
                <Text style={styles.cell}>{item.quantity}</Text>
                <Text style={styles.cell}>
                  {(item.quantity * item.price).toLocaleString()}vnd
                </Text>
              </View>
            ))}
            <View style={styles.row}>
              <Text style={styles.cell}>Tổng</Text>
              <Text style={styles.cell}></Text>
              <Text style={styles.cell}>{tongTien.toLocaleString()}vnd</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <TouchableOpacity
              style={styles.cancelReceiptBtn}
              onPress={huyDonHang}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                HỦY
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={xacNhanDonHang}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                XÁC NHẬN
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );

  useEffect(() => {
    // Initialize camera if we're on the scan tab
    if (selectedIndex === 0 && permission?.granted) {
      resetCamera();
    }

    // Clean up function
    return () => {
      stopCamera();
    };
  }, []);

  // const translateX = scrollX.interpolate({
  //   inputRange: [0, width],
  //   outputRange: [-90, 90],
  //   extrapolate: "clamp",
  // });
  const translateX = Animated.multiply(scrollX, tabWidth / width);
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

          <View style={styles.subcontainer}>
            <UserInfoCard
              name={userInfo.name ?? "none"}
              role="Owner"
              initial={userName[0]?.toUpperCase() || "A"}
              onPress={() => console.log("User card tapped")}
            />
            {/* Tabs */}
            <View style={styles.tabContainer}>
              {pages.map((p, index) => (
                <TouchableOpacity
                  key={p.key}
                  style={styles.tabButton}
                  onPress={() => scrollToIndex(index)}
                >
                  <Text style={[styles.tabText, styles.tabTextActive]}>
                    {p.title}
                  </Text>
                </TouchableOpacity>
              ))}

              <Animated.View
                style={[
                  styles.underline,
                  {
                    width: tabWidth - paddingConst,
                    left: 0,
                    transform: [{ translateX }],
                  },
                ]}
              />
            </View>
            {/* Pages */}
            <Animated.FlatList
              ref={flatListRef}
              data={pages}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.key}
              renderItem={renderItem}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              scrollEventThrottle={16}
              onViewableItemsChanged={onViewRef.current}
              viewabilityConfig={viewConfigRef.current}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ECFCCB",
    paddingTop: (StatusBar.currentHeight || 0) + 10,
    flex: 1,
  },
  subcontainer: {
    backgroundColor: "#ECFCCB",
    flex: 1,
    paddingLeft: 8,
    paddingRight: 8,
  },
  page: {
    width: width - paddingConst,
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f0fff0",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "relative",
    backgroundColor: "#d4fcd6",
    borderBottomWidth: 1,
    borderBottomColor: "#c4eec4",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 16,
    color: "#555",
    fontWeight: "normal",
  },
  tabTextActive: {
    color: "#2ecc71",
    fontWeight: "bold",
  },
  underline: {
    position: "absolute",
    bottom: 0,
    height: 3,
    backgroundColor: "#2ecc71",
  },
  subcontainer1: {
    paddingVertical: 20,
    backgroundColor: "#f0ffdd",
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    marginTop: 5,
    backgroundColor: "#fff",
  },
  popup: {
    width: "100%",
    // borderWidth: 2,
    // borderColor: 'purple',
    padding: 10,
    marginBottom: 10,
    // backgroundColor: '#fafafa',
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  cancelBtn: {
    backgroundColor: "red",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 30,
    paddingRight: 30,
    borderRadius: 10,
  },
  addBtn: {
    backgroundColor: "green",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 30,
    paddingRight: 30,
    borderRadius: 10,
  },
  whiteText: {
    color: "white",
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 5,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 5,
  },
  cellHeader: {
    flex: 1,
    fontWeight: "bold",
    paddingHorizontal: 5,
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    color: "green",
    fontSize: 16,
    marginVertical: 10,
  },
  errorMessage: {
    color: "red",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
    fontSize: 16,
  },
  confirmBtn: {
    backgroundColor: "green",
    marginTop: 15,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 30,
    paddingRight: 30,
    borderRadius: 10,
  },
  cancelReceiptBtn: {
    backgroundColor: "red",
    marginTop: 15,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 30,
    paddingRight: 30,
    borderRadius: 10,
  },
  continueBtn: {
    backgroundColor: "blue",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 6,
    marginTop: 10,
  },
  modalThongBao: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  thongBaoText: {
    color: "#555555",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Styles for dropdown
  dropdownContainer: {
    width: "100%",
    maxHeight: 200,
    backgroundColor: "#fff",
    borderColor: "#4D7C0F", // Match input border color
    borderWidth: 1,
    borderRadius: 8,
    marginTop: -10, // Overlap slightly with the input or adjust as needed
    marginBottom: 10,
    zIndex: 1000, // Ensure dropdown is on top of other elements
  },
  dropdownList: {
    width: "100%",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownItemText: {
    fontSize: 16,
    flex: 1, // Allow text to wrap if too long
  },
  dropdownItemPrice: {
    fontSize: 16,
    color: "green",
    marginLeft: 10, // Space between name and price
  },
});
