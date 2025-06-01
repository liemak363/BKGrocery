import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter, useFocusEffect } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/globalStore";
import { setAccessToken, setRefreshToken } from "@/store/globalReducer";

import { products } from "@/services/product";
import ProductType from "@/types/Product";

const WareHouseScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken, refreshToken } = useSelector(
    (state: RootState) => state.global
  );
  const router = useRouter();

  // State variables
  const [allProducts, setAllProducts] = useState<ProductType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [searchById, setSearchById] = useState("");
  const [searchByName, setSearchByName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  // Fetch products from API
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const productList = await products(
        accessToken,
        refreshToken,
        dispatch,
        setAccessToken,
        setRefreshToken
      );

      // Sort products by name
      const sortedProducts = productList.sort((a, b) =>
        a.name.localeCompare(b.name, "vi", { sensitivity: "base" })
      );

      setAllProducts(sortedProducts);
      setFilteredProducts(sortedProducts);
    } catch (error: any) {
      if (error.message === "Chưa đăng nhập") {
        if (router.canDismiss()) {
          router.dismissAll();
        }
        router.replace("/login");
        return;
      }

      Alert.alert("Lỗi", error.message || "Không thể tải danh sách sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };
  // Filter products based on search criteria
  const filterProducts = () => {
    let filtered = allProducts;

    // Filter by product ID
    if (searchById.trim()) {
      filtered = filtered.filter((product) =>
        product.id.toLowerCase().includes(searchById.toLowerCase())
      );
    }

    // Filter by product name
    if (searchByName.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchByName.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Load products when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [accessToken, refreshToken])
  );

  // Apply filters when search criteria change
  useEffect(() => {
    filterProducts();
  }, [searchById, searchByName, allProducts]);

  const toggleProductDescription = (id: string) => {
    setSelectedProductId((prevId) => (prevId === id ? null : id));
  };
  const renderItem = ({ item }: { item: ProductType }) => {
    const isSelected = item.id === selectedProductId;

    return (
      <TouchableOpacity onPress={() => toggleProductDescription(item.id)}>
        <View style={styles.tableRow}>
          <Text style={styles.cell}>{item.id}</Text>
          <Text style={styles.cell}>{item.name}</Text>
          <Text style={styles.cell}>{item.stock}</Text>
          <Text style={styles.cell}>
            {item.price.toLocaleString("vi-VN")} ₫
          </Text>
        </View>

        {isSelected && (
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              Mô tả: {"\n"} {item.description || "Chưa có mô tả."}
            </Text>
            <Text style={styles.descriptionText}>
              Ngày tạo: {new Date(item.createdAt).toLocaleDateString("vi-VN")}
            </Text>
            <Text style={styles.descriptionText}>
              Cập nhật: {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#ECFCCB" }}>
      <View style={styles.container}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
          </View>
        )}

        <FlatList
          style={styles.flatListContainer}
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingTop: 40,
            paddingBottom: 40,
          }}
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                  <Icon name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Quản lý kho</Text>
                <TouchableOpacity
                  onPress={fetchProducts}
                  style={styles.refreshButton}
                >
                  <Icon name="refresh" size={20} color="#4CAF50" />
                </TouchableOpacity>
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

              <View style={styles.resultInfo}>
                <Text style={styles.resultText}>
                  Hiển thị {filteredProducts.length} / {allProducts.length} sản
                  phẩm
                </Text>
              </View>

              <View style={styles.tableHeader}>
                <Text style={styles.headerCell}>MSP</Text>
                <Text style={styles.headerCell}>Tên hàng</Text>
                <Text style={styles.headerCell}>Số lượng</Text>
                <Text style={styles.headerCell}>Đơn giá</Text>
              </View>
            </>
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchById || searchByName
                    ? "Không tìm thấy sản phẩm phù hợp"
                    : "Chưa có sản phẩm nào"}
                </Text>
              </View>
            ) : null
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
  },
  flatListContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerText: {
    marginLeft: 15,
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#E8F5E8",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4CAF50",
  },
  searchBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  searchIcon: {
    marginLeft: 5,
  },
  resultInfo: {
    backgroundColor: "#E8F5E8",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
    textAlign: "center",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
    flex: 1,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    color: "#333",
    fontSize: 13,
  },
  descriptionBox: {
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  descriptionText: {
    fontSize: 12,
    color: "#444",
    marginBottom: 4,
    lineHeight: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default WareHouseScreen;
