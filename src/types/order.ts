import { Color, Product } from "./product";

export type Order = {
  id: string;
  product: Omit<Product, "description" | "createdAt" | "updatedAt" | "visibility">;
  status: OrderStatus;
  orderVariations: OrderVariation[];
  createdAt: string;
  updatedAt: string;
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
  shippedQuantity?: string;
  comments?: string;
};

export type OrderFormData = {
  supplierName: string;
  sku: string;
  variations: OrderVariation[];
};
