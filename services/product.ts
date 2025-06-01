import ProductType from "@/types/Product";
import { newAccessToken as getNewAccessToken } from "./auth";
import * as SecureStore from "expo-secure-store";

export async function productById(
  id: string,
  accessToken: string,
  refreshToken: string,
  dispatch: any,
  setAccessToken: any,
  setRefreshToken: any
): Promise<ProductType> {
  try {
    let res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}product?id=${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (res.status === 401) {
      // Token hết hạn, lấy token mới
      let response;
      try {
        response = await getNewAccessToken(refreshToken);
      } catch (error: any) {
        throw new Error("Chưa đăng nhập");
      }

      if (response.refresh_token) {
        await SecureStore.setItemAsync("refresh_token", response.refresh_token);
        dispatch(setRefreshToken(response.refresh_token));
      }
      await SecureStore.setItemAsync("access_token", response.access_token);
      dispatch(setAccessToken(response.access_token));

      // Gọi lại API với token mới
      res = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}product?id=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${response.access_token}`,
          },
        }
      );
    }

    if (res.status === 404) {
      throw new Error("Sản phẩm không tồn tại");
    }

    if (!res.ok) {
      throw new Error("Lấy sản phẩm không thành công, xin thử lại");
    }

    const data = await res.json();
    // {
    //   "id": '1',
    //   "createdAt": "2025-05-27T13:43:18.674Z",
    //   "updatedAt": "2025-05-27T13:43:18.674Z",
    //   "name": "dao",
    //   "description": "Táo đỏ nhập khẩu từ Mỹ",
    //   "price": 100000,
    //   "stock": 10,
    //   "userId": 1
    // }
    return data;
  } catch (error: any) {
    throw new Error(error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
  }
}
