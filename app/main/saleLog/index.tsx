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

const sampleData = [
  {
    id: "001",
    name: "Nguyễn Văn A",
    time: "15:39 14/04/2025",
    total: "300.000 vnd",
  },
  {
    id: "002",
    name: "Nguyễn Văn A",
    time: "09:10 14/04/2025",
    total: "70.000 vnd",
  },
  {
    id: "003",
    name: "Nguyễn Văn A",
    time: "15:00 13/04/2025",
    total: "230.000 vnd",
  },
  {
    id: "004",
    name: "Nguyễn Văn A",
    time: "12:01 12/04/2025",
    total: "100.000 vnd",
  },
  {
    id: "005",
    name: "Nguyễn Văn A",
    time: "09:00 12/04/2025",
    total: "90.000 vnd",
  },
  {
    id: "006",
    name: "Nguyễn Văn A",
    time: "07:10 12/04/2025",
    total: "25.000 vnd",
  },
  {
    id: "007",
    name: "Nguyễn Văn A",
    time: "08:00 11/04/2025",
    total: "80.000 vnd",
  },
  {
    id: "008",
    name: "Nguyễn Văn A",
    time: "07:50 10/04/2025",
    total: "215.000 vnd",
  },
  {
    id: "009",
    name: "Nguyễn Văn A",
    time: "07:30 09/04/2025",
    total: "11.000 vnd",
  },
];

const SalesHistoryScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Home");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(30); // dung api goi de biet tong

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tableRow}
      onPress={() => router.replace(`/salelogitem/${item.id}` as any)}
    >
      <Text style={styles.cell}>{item.id}</Text>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.time}</Text>
      <Text style={styles.cell}>{item.total}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#ECFCCB" }}>
      <View style={styles.container}>
        <FlatList
          data={sampleData}
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
                <Text style={styles.headerText}>Lịch sử bán hàng</Text>
              </View>

              <View style={styles.searchBox}>
                <TextInput
                  placeholder="Tìm kiếm theo tên người bán"
                  value={search}
                  onChangeText={setSearch}
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
                <Text style={styles.headerCell}>MĐH</Text>
                <Text style={styles.headerCell}>Người Bán</Text>
                <Text style={styles.headerCell}>Thời gian giao dịch</Text>
                <Text style={styles.headerCell}>Tổng tiền</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECFCCB",
    paddingHorizontal: 10,
    paddingTop: 40,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 50 },
  headerText: { marginLeft: 15, fontSize: 20, fontWeight: "bold" },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 30,
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
});

export default SalesHistoryScreen;
