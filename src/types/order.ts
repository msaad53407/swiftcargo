import { Color, Product } from "./product";

export type Order = {
  id: string;
  product: Omit<Product, "description" | "createdAt" | "updatedAt" | "visibility">;
  sku: string;
  supplier: string;
  quantity: string;
  status: OrderStatus;
};

export enum OrderStatus {
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  PENDING = "pending",
}

export type OrderFilters = {
  status: string[];
  sku: string;
  supplier: string;
};

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"] as const;
export type Size = (typeof SIZES)[number];

export type OrderVariation = {
  size: Size;
  color: Color;
  quantity: number;
  date: string;
  shippedQuantity?: number;
  comments?: string;
};

export type OrderFormData = {
  supplierName: string;
  sku: string;
  variations: OrderVariation[];
};
