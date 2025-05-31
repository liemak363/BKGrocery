import React, { useEffect, useState, useRef } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "@/components/ui/header";
import UserInfoCard from "@/components/ui/UserInfo";
import BottomNavBar from "@/components/ui/BottomNavBar";
import { AppDispatch, RootState } from "../../store/globalStore";

import ProductType from "@/types/Product";
import { SaleLog, SaleLogItem } from "@/types/SaleLog";
import { productById } from "@/services/product";

import { CameraView, useCameraPermissions } from "expo-camera";

const { width } = Dimensions.get("window");
const paddingConst = 16; // padding for the FlatList container

const pages = [
  { key: "1", title: "Quét QR Code" },
  { key: "2", title: "Nhập sản phẩm" },
];
// dữ liệu tạm thôi
const khoHang = {
  "Bịch đường": 10000,
  "Thùng mì hảo hảo": 160000,
  "Dầu ăn": 45000,
  "Bịch muối": 5000,
};

export default function Explore() {
  const { accessToken } = useSelector((state: RootState) => state.global);

  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  // cho don thanh toan
  const [sanPhamNhap, setSanPhamNhap] = useState("");
  const [soLuongNhap, setSoLuongNhap] = useState("");
  const [sanPhamTimDuoc, setSanPhamTimDuoc] = useState<ProductType | null>(
    null
  );
  const [sanPhamKoTimDuoc, setSanPhamKoTimDuoc] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [donHang, setDonHang] = useState<SaleLogItem[]>([]);
  const [saleLog, setSaleLog] = useState<SaleLog>({
    createdAt: new Date().toISOString(),
    items: [],
  });
  const [thongBao, setThongBao] = useState("");
  const [hienThongBao, setHienThongBao] = useState(false);
  const timSanPham = async (productId: string) => {
    setSanPhamKoTimDuoc(null);
    setIsLoading(true);

    try {
      // Call the API to get product details
      const product = await productById(productId, accessToken);
      setSanPhamTimDuoc(product);
    } catch (error: any) {
      console.error("Error fetching product:", error);
      setSanPhamKoTimDuoc(
        error.message || `Không tìm thấy sản phẩm với mã: ${productId}`
      );
    } finally {
      setIsLoading(false);
    }
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

    let updatedItems: SaleLogItem[];

    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      updatedItems = [...donHang];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
      };
    } else {
      // Add new product to order
      const newItem: SaleLogItem = {
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
      // Here you would call your API to submit the sales order
      // For example:
      // await submitSalesOrder(saleLog, accessToken);

      // For now, we'll just simulate a successful submission
      console.log("Submitting order:", JSON.stringify(saleLog));

      // Reset the order
      setDonHang([]);
      setSaleLog({
        createdAt: new Date().toISOString(),
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
  const tongTien = donHang.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );

  // hiệu ứng
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("Home");
  const [userName, setUserName] = useState("none");

  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [selectedIndex, setSelectedIndex] = useState(0);

  const tabWidth = width / pages.length;

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index ?? 0;
      setSelectedIndex(index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index });
  };

  const renderItem = ({ item }: { item: { key: string; title: string } }) => (
    <View style={styles.page}>
      {/* <Text style={styles.pageTitle}>{item.title}</Text> */}
      {item.key === "1" ? (
        <View style={styles.subcontainer1}>
          {hienThongBao && (
            <View style={styles.modalThongBao}>
              <Text style={styles.thongBaoText}>Đã ghi nhận đơn hàng</Text>
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
            onChangeText={setSanPhamNhap}
            onSubmitEditing={() => timSanPham(sanPhamNhap)}
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
                    setSanPhamNhap(data); // điền vào state
                    timSanPham(data); // gọi hàm tìm
                    setTimeout(() => setIsScanning(true), 3000); // cho phép quét lại sau 3s
                  }
                }}
              />
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
          {sanPhamKoTimDuoc && (
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
                  onPress={() => setSanPhamTimDuoc(null)}
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
          <TouchableOpacity style={styles.confirmBtn} onPress={xacNhanDonHang}>
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
      ) : (
        <View style={styles.subcontainer1}>
          {hienThongBao && (
            <View style={styles.modalThongBao}>
              <Text style={styles.thongBaoText}>Đã ghi nhận đơn hàng</Text>
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
            onChangeText={setSanPhamNhap}
            onSubmitEditing={() => timSanPham(sanPhamNhap)}
            placeholder="Tên sản phẩm"
          />
          {sanPhamKoTimDuoc && (
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
                  onPress={() => setSanPhamTimDuoc(null)}
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
          <TouchableOpacity style={styles.confirmBtn} onPress={xacNhanDonHang}>
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
      )}
    </View>
  );

  const handleTabPress = (tab: string) => {
    let route: string = "./" + tab;
    router.replace(route as any);
    setActiveTab(tab);
  };

  useEffect(() => {
    const fetchUserName = async () => {
      const res = await AsyncStorage.getItem("user_name");
      setUserName(res ?? "none");
    };
    fetchUserName();
  }, []);

  // const translateX = scrollX.interpolate({
  //   inputRange: [0, width],
  //   outputRange: [-90, 90],
  //   extrapolate: "clamp",
  // });
  const translateX = Animated.multiply(scrollX, tabWidth / width);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#4D7C0F"
          translucent
        />

        <View style={styles.subcontainer}>
          <UserInfoCard
            name={userName}
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

      <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
    backgroundColor: '#f0ffdd',
    width: "100%",
    // flex: 1,
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
});
