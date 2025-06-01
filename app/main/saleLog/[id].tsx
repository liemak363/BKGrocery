import React, { useState, useEffect } from "react";
import {
  View,
  Text,
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

import { SaleLogResponse, SaleLogItemResponse } from "@/types/SaleLog";

import { getSaleLogById } from "@/services/sale";

import { useLocalSearchParams } from "expo-router";

const SaleLogIttemScreen = () => {
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken, refreshToken } = useSelector(
    (state: RootState) => state.global
  );

  const router = useRouter();

  // State management
  const [saleLog, setSaleLog] = useState<SaleLogResponse | null>(null);
  const [items, setItems] = useState<SaleLogItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sale log details
  useEffect(() => {
    const fetchSaleLogDetails = async () => {
      if (!id || typeof id !== "string") {
        setError("ID giao dịch không hợp lệ");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getSaleLogById(
          accessToken,
          refreshToken,
          dispatch,
          setAccessToken,
          setRefreshToken,
          id
        );

        setSaleLog(response.saleLog);
        setItems(response.items);
      } catch (err: any) {
        setError(err.message || "Không thể tải chi tiết giao dịch");
        Alert.alert("Lỗi", err.message || "Không thể tải chi tiết giao dịch");
      } finally {
        setLoading(false);
      }
    };

    fetchSaleLogDetails();
  }, [id, accessToken, refreshToken, dispatch]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Đang tải chi tiết giao dịch...</Text>
      </View>
    );
  }

  // Error state
  if (error || !saleLog) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Icon name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>
          {error || "Không tìm thấy giao dịch"}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: "#ECFCCB" }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Chi tiết đơn hàng</Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.infoText}>
            THỜI GIAN GIAO DỊCH: {formatDate(saleLog.createdAt)}
          </Text>
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
            data={items}
            keyExtractor={(item) => `${item.saleLogId}-${item.productId}`}
            renderItem={({ item, index }) => (
              <View style={styles.tableRow}>
                <Text style={styles.cell}>{index + 1}</Text>
                <Text style={styles.cell}>{item.productName}</Text>
                <Text style={styles.cell}>{item.quantity}</Text>
                <Text style={styles.cell}>
                  {item.total.toLocaleString()} vnd
                </Text>
              </View>
            )}
          />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng tiền</Text>
            <Text style={styles.totalAmount}>
              {saleLog.total.toLocaleString()} vnd
            </Text>
          </View>
        </View>
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
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 50,
  },
  headerText: {
    marginLeft: 15,
    fontSize: 20,
    fontWeight: "bold",
  },
  infoBlock: {
    marginBottom: 30,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#22c55e",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#e5f3ff",
    paddingVertical: 12,
    borderTopWidth: 2,
    borderTopColor: "#22c55e",
  },
  totalLabel: {
    flex: 2,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  totalAmount: {
    flex: 2,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    color: "#22c55e",
  },
  paymentHeader: {
    color: "green",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
});

export default SaleLogIttemScreen;
