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
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/globalStore";
import Pagination from "@/components/ui/Pagination";

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

const WareHouseScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Home");
  const [searchById, setSearchById] = useState("");
  const [searchByName, setSearchByName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(30); // dung api goi de biet tong

  const [selectedProductId, setSelectedProductId] = useState(null);

  const toggleProductDescription = (id) => {
    setSelectedProductId((prevId) => (prevId === id ? null : id));
  };

  const renderItem = ({ item }) => {
    const isSelected = item.id === selectedProductId;

    return (
      <TouchableOpacity onPress={() => toggleProductDescription(item.id)}>
        <View style={styles.tableRow}>
          <Text style={styles.cell}>{item.id}</Text>
          <Text style={styles.cell}>{item.name}</Text>
          <Text style={styles.cell}>{item.stock}</Text>
          <Text style={styles.cell}>{item.price}</Text>
        </View>

        {isSelected && (
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              Vị trí: {"\n"} {item.description || "Chưa có mô tả."}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ECFCCB" }}>
      <View style={styles.container}>
        <FlatList
          data={sampleProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingTop: 40,
            paddingBottom: 100,
          }}
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => router.replace("/home" as any)}
                >
                  <Icon name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Quản lý kho</Text>
              </View>

              <View style={styles.searchBox}>
                <TextInput
                  placeholder="Tìm kiếm theo tên mặt hàng"
                  value={searchByName}
                  onChangeText={setSearchByName}
                  style={styles.searchInput}
                />
                <Icon
                  name="search"
                  size={20}
                  color="gray"
                  style={styles.searchIcon}
                />
              </View>

              <View style={styles.searchBox}>
                <TextInput
                  placeholder="Tìm kiếm theo mã sản phẩm"
                  value={searchById}
                  onChangeText={setSearchById}
                  style={styles.searchInput}
                />
                <Icon
                  name="search"
                  size={20}
                  color="gray"
                  style={styles.searchIcon}
                />
              </View>

              <View style={styles.tableHeader}>
                <Text style={styles.headerCell}>MSP</Text>
                <Text style={styles.headerCell}>Tên hàng</Text>
                <Text style={styles.headerCell}>Số lượng</Text>
                <Text style={styles.headerCell}>Đơn giá</Text>
              </View>
            </>
          }
          ListFooterComponent={
            <Pagination
              totalItems={totalItems}
              itemsPerPage={10}
              currentPage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          }
        />
      </View>
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

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchInput: { flex: 1, height: 40 },
  searchIcon: { marginLeft: 5 },

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
  listContainer: {
    paddingBottom: 0,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  descriptionBox: {
    padding: 8,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
  descriptionText: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#444",
  },
});

export default WareHouseScreen;
