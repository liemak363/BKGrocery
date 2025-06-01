import { ImportProductType, ImportLogType } from "@/types/Import";
import { newAccessToken as getNewAccessToken } from "./auth";
import * as SecureStore from "expo-secure-store";

export async function importProduct(
  product: ImportProductType,
  accessToken: string,
  refreshToken: string,
  dispatch: any,
  setAccessToken: any,
  setRefreshToken: any
) {
  try {
    console.log([product]);
    let res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}import`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify([product]),
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
        `${process.env.EXPO_PUBLIC_BACKEND_URL}import`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${response.access_token}`,
          },
          body: JSON.stringify(product),
        }
      );
    }

    if (!res.ok) {
      throw new Error("Nhập sản phẩm không thành công, xin thử lại");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
}