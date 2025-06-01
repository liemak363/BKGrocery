import { SaleLog } from "@/types/SaleLog";

// [POST] /sale
export async function postSale(saleLog: SaleLog, accessToken: string) {
  try {
    const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}sale`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify([saleLog]),
    });

    if (!res.ok) {
      throw new Error("Giao dịch không thành công, xin thử lại");
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
  }
}
