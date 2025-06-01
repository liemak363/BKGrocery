export interface ImportProductType {
  name: string;
  quantity?: number;
  price: number;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  productId: string;
}

export interface ImportLogType {
  id: number;
  quantity: number;
  price: number;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  productId: string;
  userId: number;
  product: {
    name: string;
  }
}