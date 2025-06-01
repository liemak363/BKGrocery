import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/globalStore";
import { setAccessToken, setRefreshToken } from "@/store/globalReducer";

import { SaleLog } from "@/types/SaleLog";
import { getSaleLogs } from "@/services/sale";

import Pagination from "@/components/ui/Pagination";

const ITEMS_PER_PAGE = 10;

const SalesHistoryScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken, refreshToken } = useSelector(
    (state: RootState) => state.global
  );

  const router = useRouter();

  // State for data and pagination
  const [saleLogs, setSaleLogs] = useState<SaleLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // State for date filter
  const [lastTime, setLastTime] = useState("");

  // Calculate offset based on current page
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format price
  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + " ₫";
  }; 
  
  // Fetch sale logs from API
  const fetchSaleLogs = async () => {
    // Keep lastTime as Vietnam time without timezone conversion
    let lastTimeInput = lastTime.trim() || null;

    // If user provided time, treat it as Vietnam timezone
    if (lastTimeInput) {
      lastTimeInput = lastTimeInput + "+07:00";
    }

    setIsLoading(true);
    try {
      const logs = await getSaleLogs(
        accessToken,
        refreshToken,
        dispatch,
        setAccessToken,
        setRefreshToken,
        lastTimeInput,
        offset,
        ITEMS_PER_PAGE
      );

      setSaleLogs(logs);
      // Estimate total items based on returned data
      if (logs.length < ITEMS_PER_PAGE) {
        setTotalItems(offset + logs.length);
      } else {
        setTotalItems(offset + ITEMS_PER_PAGE + 1); // Estimate there might be more
      }
    } catch (error: any) {
      console.error("Error fetching sale logs:", error);
      if (error.message === "Chưa đăng nhập") {
        if (router.canDismiss()) {
          router.dismissAll();
        }
        router.replace("/login");
        return;
      }
      Alert.alert("Lỗi", error.message || "Không thể tải lịch sử bán hàng");
    } finally {
      setIsLoading(false);
    }
  };

  // Search by date
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
    fetchSaleLogs();
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Load data on component mount and when page changes
  useEffect(() => {
    fetchSaleLogs();
  }, [currentPage]);

  const renderItem = ({ item, index }: { item: SaleLog; index: number }) => {
    // Calculate sequential number based on current page and index
    const sequentialNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

    return (
      <TouchableOpacity
        style={styles.tableRow}
        onPress={() => router.push(`/main/saleLog/${item.id}`)}
      >
        <Text style={styles.cell}>{sequentialNumber}</Text>
        <Text style={styles.cell}>{formatDate(item.createdAt)}</Text>
        <Text style={styles.cell}>{formatPrice(item.total || 0)}</Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#ECFCCB" }}>
      <FlatList
        style={styles.container}
        data={saleLogs}
        renderItem={renderItem}
        keyExtractor={(item) => (item.id || "").toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Icon name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.headerText}>Lịch sử bán hàng</Text>
            </View>

            <View style={styles.searchBox}>
              <TextInput
                placeholder="Nhập ngày giờ (YYYY-MM-DD HH:mm) để lọc lịch sử"
                value={lastTime}
                onChangeText={setLastTime}
                style={styles.searchInput}
              />
              <TouchableOpacity
                onPress={handleSearch}
                style={styles.searchButton}
              >
                <Icon name="search" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2C9B1F" />
                <Text style={styles.loadingText}>Đang tải...</Text>
              </View>
            )}

            <View style={styles.tableHeader}>
              <Text style={styles.headerCell}>STT</Text>
              <Text style={styles.headerCell}>Thời gian giao dịch</Text>
              <Text style={styles.headerCell}>Tổng tiền</Text>
            </View>
          </>
        }
        ListFooterComponent={
          !isLoading ? (
            <Pagination
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không có dữ liệu</Text>
            </View>
          ) : null
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
    marginBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 10,
  },
  headerText: {
    marginLeft: 15,
    fontSize: 20,
    fontWeight: "bold",
  },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  searchButton: {
    backgroundColor: "#2C9B1F",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },

  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#2C9B1F",
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
    fontSize: 12,
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
    fontSize: 13,
  },
  listContainer: {
    paddingBottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});

export default SalesHistoryScreen;
