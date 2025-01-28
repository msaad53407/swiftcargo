import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase/config";
import { Optional } from "@/types";
import { AddProductErrorType, Color, Product, Variation, VariationErrorType } from "@/types/product";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import z from "zod";

export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    const docSnap = await getDoc(doc(db, "products", id));
    if (docSnap.exists()) {
      const variations = await getDocs(collection(db, "products", id, "variations"));
      return {
        id: docSnap.id,
        name: docSnap.data()?.name,
        description: docSnap.data()?.description,
        image: docSnap.data()?.image,
        sku: docSnap.data()?.sku,
        visibility: docSnap.data()?.visibility,
        variations: variations.docs.map((variation) => ({
          id: variation.id,
          size: variation.data()?.size,
          colors: variation.data()?.colors,
        })),
        createdAt: docSnap.data()?.createdAt,
        updatedAt: docSnap.data()?.updatedAt,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

export const getProducts = async (
  maxLimit: number = 10,
  pageNumber: number = 1,
): Promise<{ products: Product[]; total: number }> => {
  try {
    // First get total count
    const totalSnapshot = await getCountFromServer(collection(db, "products"));
    const total = totalSnapshot.data().count;

    // Base query
    let queryConstraints: any = [orderBy("createdAt", "desc"), limit(maxLimit)];

    // If it's not the first page, we need all previous pages' last docs
    if (pageNumber > 1) {
      // Get the last doc of the previous page
      const previousPageQuery = query(
        collection(db, "products"),
        orderBy("createdAt", "desc"),
        limit(maxLimit * (pageNumber - 1)),
      );
      const previousPageDocs = await getDocs(previousPageQuery);
      const lastVisibleDoc = previousPageDocs.docs[previousPageDocs.docs.length - 1];

      if (lastVisibleDoc) {
        queryConstraints.push(startAfter(lastVisibleDoc));
      }
    }

    // Execute the query with all constraints
    const paginatedQuery = query(collection(db, "products"), ...queryConstraints);
    const querySnapshot = await getDocs(paginatedQuery);

    const products = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const variations = await getDocs(collection(db, "products", doc.id, "variations"));
        return {
          id: doc.id,
          name: doc.data()?.name,
          description: doc.data()?.description,
          image: doc.data()?.image,
          sku: doc.data()?.sku,
          visibility: doc.data()?.visibility,
          variations: variations.docs.map((variation) => ({
            id: variation.id,
            size: variation.data()?.size,
            colors: variation.data()?.color,
          })),
          createdAt: doc.data()?.createdAt,
          updatedAt: doc.data()?.updatedAt,
        };
      }),
    );

    return { products, total };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], total: 0 };
  }
};

export const addProductSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().optional(),
  image: z
    .string()
    // .min(3, { message: "Image URL must be at least 3 characters" }),
    .optional(),
  sku: z.string().min(3, { message: "SKU must be at least 3 characters" }),
  visibility: z.boolean().default(true),
});

export const updateProductSchema = addProductSchema.extend({
  id: z.string(),
});

export type ProductFormValues = z.infer<typeof addProductSchema>;

export type UpdateProductFormValues = z.infer<typeof updateProductSchema>;

export const variationsSchema = z.object({
  size: z.string(),
  colors: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      hexCode: z.string(),
    }),
  ),
});

export const addProduct = async (
  product: Omit<Product, "id" | "createdAt" | "updatedAt" | "variations">,
  variations: Omit<Variation, "id">[],
) => {
  const errors: AddProductErrorType = {
    product: null,
    variations: [],
  };

  const productResult = addProductSchema.safeParse(product);
  if (!productResult.success) {
    errors.product = productResult.error.flatten().fieldErrors;
  }

  variations.forEach((variation, index) => {
    const variationResult = variationsSchema.safeParse(variation);
    if (!variationResult.success) {
      errors.variations[index] = variationResult.error.flatten().fieldErrors as VariationErrorType;
    }
  });

  const hasErrors = errors.product !== null || errors.variations.some((variationError) => variationError !== null);
  if (hasErrors) {
    return {
      success: false,
      error: errors,
    };
  }

  try {
    const productRef = await addDoc(collection(db, "products"), {
      ...productResult.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    for (const variation of variations) {
      await addDoc(collection(db, "products", productRef.id, "variations"), variation);
    }
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("Error adding product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const updateProduct = async (
  id: string,
  product: Omit<Product, "id" | "createdAt" | "updatedAt" | "variations">,
  updatedVariations: Optional<Variation, "id">[],
) => {
  try {
    const errors: AddProductErrorType = {
      product: null,
      variations: [],
    };

    const productResult = addProductSchema.safeParse(product);
    if (!productResult.success) {
      errors.product = productResult.error.flatten().fieldErrors;
    }

    updatedVariations.forEach((variation, index) => {
      const variationResult = variationsSchema.safeParse(variation);
      if (!variationResult.success) {
        errors.variations[index] = variationResult.error.flatten().fieldErrors as VariationErrorType;
      }
    });

    const hasErrors = errors.product !== null || errors.variations.some((variationError) => variationError !== null);
    if (hasErrors) {
      return {
        success: false,
        error: errors,
      };
    }

    await updateDoc(doc(db, "products", id), {
      name: product.name,
      description: product.description,
      image: product.image,
      sku: product.sku,
      updatedAt: new Date().toISOString(),
    });

    const existingVariations: Variation[] = updatedVariations.filter((v): v is Variation => v.id !== "");

    const variationsToDelete = existingVariations.filter((v) => v.colors.length === 0);

    const variationsLeftAfterDeletion = existingVariations.filter((v) => v.colors.length > 0);

    for (const variation of variationsToDelete) {
      await deleteDoc(doc(db, "products", id, "variations", variation.id));
    }

    // update existing variations
    for (const variation of variationsLeftAfterDeletion) {
      await updateDoc(doc(db, "products", id, "variations", variation.id), variation);
    }

    const newVariations = updatedVariations.filter((v) => !v.id);

    // add new variations
    for (const variation of newVariations) {
      // TODO fix ids not appearing in new variations added from update page
      await addDoc(collection(db, "products", id, "variations"), variation);
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const toggleProductVisibility = async (id: string) => {
  try {
    const product = await getProduct(id);
    console.log(product);
    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    await updateDoc(doc(db, "products", id), {
      visibility: !product.visibility,
    });

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("Error updating product visibility:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const productRef = doc(db, "products", id);
    await deleteDoc(productRef);

    const variationsRef = collection(productRef, "variations");
    const variationsQuery = await getDocs(variationsRef);
    const variationsBatch = writeBatch(db);
    variationsQuery.docs.forEach((variationDoc) => {
      variationsBatch.delete(variationDoc.ref);
    });
    await variationsBatch.commit();
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
};

export const addColor = async (color: Omit<Color, "id">) => {
  try {
    await addDoc(collection(db, "colors"), color);
    return true;
  } catch (error) {
    console.error("Error adding color:", error);
    return false;
  }
};

export const getColors = async (): Promise<Color[]> => {
  try {
    const q = query(collection(db, "colors"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data()?.name,
      hexCode: doc.data()?.hexCode,
    }));
  } catch (error) {
    console.error("Error fetching colors:", error);
    return [];
  }
};

export const uploadImage = async (file: File) => {
  if (!file) return null;
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ecommerce_images");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    const data = await response.json();
    const url = data.secure_url || data.url;

    return url;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};
