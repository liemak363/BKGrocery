export interface SaleLogPost {
  total?: number;
  createdAt: string;
  updatedAt?: string;
  items: SaleLogItemPost[];
}

export interface SaleLogItemPost {
  productId: string;
  price: number;
  quantity: number;
  name?: string;
}

export interface SaleLogResponse {
  id: string;
  total: number;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
}

export interface SaleLogItemResponse {
  saleLogId: string;
  productId: string;
  price: number;
  quantity: number;
  productName: string;
  productDescription?: string;
  total: number; // Total price for this item
}
