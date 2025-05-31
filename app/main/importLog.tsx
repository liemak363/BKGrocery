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

const sampleData = {
  data: [
    {
      id: 1,
      quantity: 10,
      price: 100000,
      description: "Táo đỏ nhập khẩu từ Mỹ",
      createdAt: "2025-05-26T00:00:00.000Z",
      updatedAt: "2025-05-26T00:00:00.000Z",
      productId: 1,
      userId: 1,
      product: {
        name: "Táo đỏ Mỹ",
      },
    },
    {
      id: 2,
      quantity: 5,
      price: 150000,
      description: "Nho đen không hạt Úc",
      createdAt: "2025-05-27T00:00:00.000Z",
      updatedAt: "2025-05-27T00:00:00.000Z",
      productId: 2,
      userId: 1,
      product: {
        name: "Nho đen Úc",
      },
    },
    {
      id: 3,
      quantity: 20,
      price: 50000,
      description: "Chuối già sạch từ Việt Nam",
      createdAt: "2025-05-28T00:00:00.000Z",
      updatedAt: "2025-05-28T00:00:00.000Z",
      productId: 3,
      userId: 2,
      product: {
        name: "Chuối già Việt Nam",
      },
    },
  ],
};

const ImportLogScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Home");
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
          <Text style={styles.cell}>{item.product.name}</Text>
          <Text style={styles.cell}>{item.quantity}</Text>
          <Text style={styles.cell}>{item.price}</Text>
        </View>

        {isSelected && (
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              Mô tả: {"\n"} {item.description || "Chưa có mô tả."}
              {"\n"}
              Ngày nhập: {"\n"} {item.createdAt}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ECFCCB" }}>
      <FlatList
        style={styles.container}
        data={sampleData.data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.replace("/home" as any)}>
                <Icon name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.headerText}>Lịch sử nhập kho</Text>
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

            <View style={styles.tableHeader}>
              <Text style={styles.headerCell}>STT</Text>
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
            onPageChange={(page) => {
              setCurrentPage(page);
            }}
          />
        }
      />
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

export default ImportLogScreen;
