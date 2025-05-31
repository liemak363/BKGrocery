import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import BottomNavBar from "@/components/ui/BottomNavBar";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/globalStore";
import Pagination from "@/components/ui/Pagination";
import { useLocalSearchParams } from "expo-router";

const sampleProducts = [
  {
    id: "301",
    name: "Thùng mì hảo hảo",
    price: 160000,
    stock: 30,
    description: "Tủ hàng ở vị trí hàng 3 góc bên trái, ngăn trên cùng",
  },
  {
    id: "302",
    name: "Thùng mì omachi",
    price: 260000,
    stock: 20,
    description: "Tủ hàng ở vị trí hàng 3 góc bên trái, ngăn trên cùng",
  },
  {
    id: "303",
    name: "Thùng mì 3 miền",
    price: 150000,
    stock: 25,
    description: "Tủ hàng ở vị trí hàng 3 góc bên trái, ngăn trên cùng",
  },
  {
    id: "304",
    name: "Thùng phở Gà",
    price: 230000,
    stock: 25,
    description: "Tủ hàng ở vị trí hàng 3 góc bên trái, ngăn trên cùng",
  },
  {
    id: "305",
    name: "Gói mì hảo hảo",
    price: 4800,
    stock: 300,
    description: "Tủ hàng ở vị trí hàng 3 góc bên trái, ngăn trên cùng",
  },
  {
    id: "306",
    name: "Gói omachi",
    price: 8900,
    stock: 200,
    description: "Tủ hàng ở vị trí hàng 3 góc bên trái, ngăn trên cùng",
  },
  {
    id: "307",
    name: "Kem đánh răng PS",
    price: 42000,
    stock: 60,
    description: "Tủ hàng ở vị trí hàng 3 góc bên trái, ngăn trên cùng",
  },
  {
    id: "308",
    name: "Kem đánh răng Closeup",
    price: 40000,
    stock: 50,
    description: "Tủ hàng ở vị trí hàng 3 góc bên trái, ngăn trên cùng",
  },
  {
    id: "309",
    name: "Dao gọt trái cây",
    price: 60000,
    stock: 10,
    description: "Tủ hàng ở vị trí hàng 3 góc bên trái, ngăn trên cùng",
  },
  {
    id: "310",
    name: "Hộp bông ngoài tai",
    price: 24000,
    stock: 30,
    description: "Tủ hàng ở vị trí hàng 3 góc bên trái, ngăn trên cùng",
  },
];

//data mẫu
const mockSaleLog = {
  saleLogId: "001",
  userId: "u001",
  userName: "Nguyễn Văn A",
  transactionTime: "15:30 14/04/2002",
  items: [
    {
      productId: "001",
      productName: "Thùng mì Hảo Hảo",
      quantity: 1,
      price: 160000,
    },
    {
      productId: "002",
      productName: "Dầu ăn",
      quantity: 3,
      price: 135000,
    },
    {
      productId: "003",
      productName: "Bịch muối",
      quantity: 1,
      price: 5000,
    },
  ],
};

const SaleLogIttemScreen = () => {
  const { id } = useLocalSearchParams(); //id lấy được từ url
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Home");

  const handleTabPress = (tab: string) => {
    console.log(tab);
    // Map tab names to valid route paths
    let route: string;
    route = "../" + tab;
    router.replace(route as any);
    setActiveTab(tab);
  };

  const totalAmount = mockSaleLog.items.reduce(
    (sum, item) => sum + item.price,
    0
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#ECFCCB" }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/history" as any)}>
            <Icon name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Chi tiết đơn hàng</Text>
        </View>

        <View style={styles.infoBlock}>
          <Text>MÃ ĐƠN HÀNG: {id}</Text>
          <Text>TÊN NGƯỜI BÁN: {mockSaleLog.userName}</Text>
          <Text>THỜI GIAN GIAO DỊCH: {mockSaleLog.transactionTime}</Text>
        </View>

        <Text style={styles.paymentHeader}>ĐƠN THANH TOÁN</Text>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>STT</Text>
            <Text style={styles.headerCell}>Tên hàng</Text>
            <Text style={styles.headerCell}>Số lượng</Text>
            <Text style={styles.headerCell}>Giá</Text>
          </View>

          <FlatList
            data={mockSaleLog.items}
            keyExtractor={(item) => item.productId}
            renderItem={({ item, index }) => (
              <View style={styles.tableRow}>
                <Text style={styles.cell}>{index + 1}</Text>
                <Text style={styles.cell}>{item.productName}</Text>
                <Text style={styles.cell}>{item.quantity}</Text>
                <Text style={styles.cell}>
                  {item.price.toLocaleString()} vnd
                </Text>
              </View>
            )}
          />
          <View style={styles.tableRow}>
            <Text style={styles.cell}>Tổng tiền</Text>
            <Text style={styles.cell}>{totalAmount.toLocaleString()} vnd</Text>
          </View>
        </View>
      </View>
      <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECFCCB",
    paddingHorizontal: 10,
    paddingTop: 40,
    marginBottom: 100,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 50 },
  headerText: { marginLeft: 15, fontSize: 20, fontWeight: "bold" },

  tableContainer: {
    marginTop: 16,
    marginBottom: 30,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 3, // bóng cho Android
    shadowColor: "#000", // bóng cho iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    paddingVertical: 10,
  },
  headerCell: {
    flex: 1,
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    color: "#333",
  },
  paymentHeader: {
    color: "green",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  infoBlock: {
    marginBottom: 30,
  },
});

export default SaleLogIttemScreen;
