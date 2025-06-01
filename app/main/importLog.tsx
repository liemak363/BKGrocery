import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import { useRouter } from "expo-router";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/globalStore";
import { setAccessToken, setRefreshToken } from "@/store/globalReducer";

import { ImportLogType } from "@/types/Import";
import { importLog } from "@/services/import";

import Pagination from "@/components/ui/Pagination";

const ITEMS_PER_PAGE = 12;

const ImportLogScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken, refreshToken } = useSelector(
    (state: RootState) => state.global
  );

  const router = useRouter();

  // State for data and pagination
  const [importLogs, setImportLogs] = useState<ImportLogType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // State for date filter
  const [lastTime, setLastTime] = useState("");

  // State for expanded descriptions
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );

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

  // Fetch import logs from API
  const fetchImportLogs = async () => {
    setIsLoading(true);
    try {
      const logs = await importLog(
        accessToken,
        refreshToken,
        dispatch,
        setAccessToken,
        setRefreshToken,
        lastTime || null,
        offset,
        ITEMS_PER_PAGE
      );

      setImportLogs(logs);
      // Note: You might need to adjust this if the API returns total count
      // For now, we'll estimate based on the returned data
      if (logs.length < ITEMS_PER_PAGE) {
        setTotalItems(offset + logs.length);
      } else {
        setTotalItems(offset + ITEMS_PER_PAGE + 1); // Estimate there might be more
      }
    } catch (error: any) {
      console.error("Error fetching import logs:", error);
      if (error.message === "Chưa đăng nhập") {
        if (router.canDismiss()) {
          router.dismissAll();
        }
        router.replace("/login");
        return;
      }
      Alert.alert("Lỗi", error.message || "Không thể tải lịch sử nhập kho");
    } finally {
      setIsLoading(false);
    }
  };

  // Search by date
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
    fetchImportLogs();
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Toggle product description
  const toggleProductDescription = (id: number) => {
    setSelectedProductId((prevId) => (prevId === id ? null : id));
  };

  // Load data on component mount and when page/filter changes
  useEffect(() => {
    fetchImportLogs();
  }, [currentPage]);
  const renderItem = ({
    item,
    index,
  }: {
    item: ImportLogType;
    index: number;
  }) => {
    const isSelected = item.id === selectedProductId;
    // Calculate sequential number based on current page and index
    const sequentialNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

    return (
      <TouchableOpacity onPress={() => toggleProductDescription(item.id)}>
        <View style={styles.tableRow}>
          <Text style={styles.cell}>{sequentialNumber}</Text>
          <Text style={styles.cell}>{item.product.name}</Text>
          <Text style={styles.cell}>{item.quantity}</Text>
          <Text style={styles.cell}>{formatPrice(item.price)}</Text>
          <Text style={[styles.cell, styles.timeCell]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>

        {isSelected && (
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              Mô tả: {"\n"} {item.description || "Chưa có mô tả."}
              {"\n"}
              Ngày nhập: {"\n"} {formatDate(item.createdAt)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#ECFCCB" }}>
      <View style={{ paddingTop: (StatusBar.currentHeight || 0) + 10 }}></View>
      <FlatList
        style={styles.container}
        data={importLogs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Icon name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.headerText}>Lịch sử nhập kho</Text>
            </View>

            <View style={styles.searchBox}>
              <TextInput
                placeholder="Ngày (YYYY-MM-DD) để lọc lịch sử trước đó"
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
              <Text style={styles.headerCell}>Tên hàng</Text>
              <Text style={styles.headerCell}>SL</Text>
              <Text style={styles.headerCell}>Đơn giá</Text>
              <Text style={styles.headerCell}>Thời gian</Text>
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
  timeCell: {
    fontSize: 12,
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
    backgroundColor: "#f5f5f5",
  },
  descriptionText: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#444",
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

export default ImportLogScreen;
