export interface SaleLog {
  total?: number;
  createdAt: string;
  items: SaleLogItem[];
}

export interface SaleLogItem {
  productId: string;
  price: number;
  quantity: number;
  name?: string;
}