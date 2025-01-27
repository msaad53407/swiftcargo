export type Product = {
	id: string;
	name: string;
	description?: string;
	image?: string;
	sku: string;
	visibility: boolean;
	variations: Variation[];
	createdAt: string;
	updatedAt: string;
};

export type Color = {
	id: string;
	name: string;
	hexCode: string;
};

export type Variation = {
	id: string;
	size: string;
	colors: string[];
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
