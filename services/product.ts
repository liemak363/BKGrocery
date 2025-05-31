import ProductType from "@/types/Product";

export async function productById(id: string, accessToken: string): Promise<ProductType> {
  try {
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}product?id=${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

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