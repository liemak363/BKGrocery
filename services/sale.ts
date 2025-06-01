import {
  SaleLogPost,
  SaleLogResponse,
  SaleLogItemResponse,
} from "@/types/SaleLog";
import { newAccessToken as getNewAccessToken } from "./auth";
import * as SecureStore from "expo-secure-store";

// [POST] /sale
export async function postSale(
  saleLog: SaleLogPost,
  accessToken: string,
  refreshToken: string,
  dispatch: any,
  setAccessToken: any,
  setRefreshToken: any
) {
  try {
    let res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}sale`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify([saleLog]),
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
      res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}sale`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${response.access_token}`,
        },
        body: JSON.stringify([saleLog]),
      });
    }

    if (!res.ok) {
      throw new Error("Giao dịch không thành công, xin thử lại");
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
  }
}

export async function getSaleLogs(
  accessToken: string,
  refreshToken: string,
  dispatch: any,
  setAccessToken: any,
  setRefreshToken: any,
  lastTime: string | null = null,
  offset: number = 0,
  limit: number = 10
): Promise<{ data: SaleLogResponse[]; count: number }> {
  try {
    const query: { lastTime?: string; offset: string; limit: string } = {
      offset: offset.toString(),
      limit: limit.toString(),
    };
    if (lastTime) {
      query.lastTime = lastTime;
    }

    let res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}sale/log?${new URLSearchParams(
        query
      ).toString()}`,
      {
        headers: {
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
        `${process.env.EXPO_PUBLIC_BACKEND_URL}sale/log?${new URLSearchParams(
          query
        ).toString()}`,
        {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        }
      );
    }

    if (!res.ok) {
      throw new Error("Không thể tải lịch sử giao dịch, xin thử lại");
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
  }
}

export async function getSaleLogById(
  accessToken: string,
  refreshToken: string,
  dispatch: any,
  setAccessToken: any,
  setRefreshToken: any,
  saleLogId: string
): Promise<{ saleLog: SaleLogResponse; items: SaleLogItemResponse[] }> {
  try {
    const query = { saleLogId };

    let res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}sale/log?${new URLSearchParams(
        query
      ).toString()}`,
      {
        headers: {
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
        `${process.env.EXPO_PUBLIC_BACKEND_URL}sale/log?${new URLSearchParams(
          query
        ).toString()}`,
        {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        }
      );
    }

    if (!res.ok) {
      throw new Error("Không thể tải giao dịch, xin thử lại");
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
  }
}
