export type Product = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  sku: string;
  weight: {
    unit: "kg" | "g";
    value: string;
  };
  numericalId: string;
  visibility: boolean;
  variations: Variation[];
  searchableFields: string[];
  createdAt: string;
  updatedAt: string;
};

export type Color = {
  name: string;
};

export type Variation = {
  id: string;
  size: string;
  colors: Color[];
};

type ProductErrorType = {
  [key in keyof Omit<Product, "id" | "createdAt" | "updatedAt">]?: string[];
};

export type VariationErrorType = {
  [key in keyof Omit<Variation, "id">]?: string[];
};

export type AddProductErrorType = {
  product?: ProductErrorType | null;
  variations: VariationErrorType[];
};
