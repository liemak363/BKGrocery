export interface SaleLog {
  id?: string;
  total?: number;
  createdAt: string;
  updatedAt?: string;
  items: SaleLogItem[];
}

export interface SaleLogItem {
  productId: string;
  price: number;
  quantity: number;
  name?: string;
}