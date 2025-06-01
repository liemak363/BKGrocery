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
    let res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify([product]),
    });

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
      res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${response.access_token}`,
        },
        body: JSON.stringify(product),
      });
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

export async function importLog(
  accessToken: string,
  refreshToken: string,
  dispatch: any,
  setAccessToken: any,
  setRefreshToken: any,
  lastTime: string | null = null,
  offset: number = 0,
  limit: number = 10
): Promise<{ data: ImportLogType[]; count: number }> {
  try {
    const query: { lastTime?: string; offset: string; limit: string } = {
      offset: offset.toString(),
      limit: limit.toString(),
    };
    if (lastTime) {
      query.lastTime = lastTime;
    }

    let res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}import/log?${new URLSearchParams(
        query
      ).toString()}`,
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
      dispatch(setAccessToken(response.access_token)); // Gọi lại API với token mới
      res = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}import/log?${new URLSearchParams(
          query
        ).toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${response.access_token}`,
          },
        }
      );
    }

    if (!res.ok) {
      throw new Error(
        "Lấy nhật ký nhập sản phẩm không thành công, xin thử lại"
      );
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
}
