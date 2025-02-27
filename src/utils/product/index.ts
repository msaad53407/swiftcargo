import { db } from "@/firebase/config";
import { Optional } from "@/types";
import { AddProductErrorType, Color, Product, Variation, VariationErrorType } from "@/types/product";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  getCountFromServer,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import z from "zod";
import {
  notifyEcommerceProductAdded,
  notifyEcommerceProductDeleted,
  notifyEcommerceProductUpdated,
  notifyEcommerceProductVisibilityUpdated,
} from "../notificaiton";

export const getTotalProductsCount = async () => {
  try {
    const totalSnapshot = await getCountFromServer(collection(db, "products"));
    return totalSnapshot.data().count;
  } catch (error) {
    console.error("Error fetching total products count:", error);
    return -1;
  }
};

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
        weight: docSnap.data()?.weight,
        numericalId: docSnap.data()?.numericalId,
        visibility: docSnap.data()?.visibility,
        searchableFields: docSnap.data()?.searchableFields,
        variations: variations.docs.map((variation) => ({
          id: variation.id,
          size: variation.data()?.size,
          colors: variation.data()?.colors,
        })),
        createdAt: docSnap.data()?.createdAt.toDate(),
        updatedAt: docSnap.data()?.updatedAt.toDate(),
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
  searchTerm?: string,
): Promise<{ products: Product[]; total: number }> => {
  try {
    // First get total count
    const totalSnapshot = await getCountFromServer(collection(db, "products"));
    const total = totalSnapshot.data().count;

    const generateSearchTerms = (term: string): string[] => {
      const terms = term.toLowerCase().split(" ");
      return terms.flatMap((t) => t.split("").map((_, index) => t.slice(0, index + 1)));
    };

    // Base query
    let queryConstraints: any[] = [orderBy("createdAt", "desc"), limit(maxLimit)];

    if (searchTerm) {
      const searchTerms = generateSearchTerms(searchTerm);
      queryConstraints.push(where("searchableFields", "array-contains-any", searchTerms));
    }

    // If it's not the first page, we need all previous pages' last docs
    if (pageNumber > 1) {
      // Get the last doc of the previous page
      const previousPageQuery = query(
        collection(db, "products"),
        ...(searchTerm ? [where("searchableFields", "array-contains-any", generateSearchTerms(searchTerm))] : []),
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
          weight: doc.data()?.weight,
          numericalId: doc.data()?.numericalId,
          visibility: doc.data()?.visibility,
          searchableFields: doc.data()?.searchableFields,
          variations: variations.docs.map((variation) => ({
            id: variation.id,
            size: variation.data()?.size,
            colors: variation.data()?.colors.map((color: Color) => ({
              name: color.name,
            })),
          })),
          createdAt: doc.data()?.createdAt.toDate(),
          updatedAt: doc.data()?.updatedAt.toDate(),
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
  weight: z.object({
    unit: z.enum(["kg", "g"]).default("g"),
    value: z.string().min(1, { message: "Weight must be at least 1 character" }),
  }),
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
      name: z.string(),
    }),
  ),
});

const generateSearchableFields = (name: string, sku: string) => {
  const searchableFields = [
    name.toLowerCase(),
    sku.toLowerCase(),
    ...name.toLowerCase().split(" "),
    ...sku.toLowerCase().split("-"),
    ...name.toLowerCase().split(""),
    ...sku.toLowerCase().split(""),
  ];
  return [...new Set(searchableFields)];
};

export const addProduct = async (
  product: Omit<Product, "id" | "createdAt" | "updatedAt" | "variations" | "searchableFields" | "numericalId">,
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
    let productRef: DocumentReference<DocumentData, DocumentData> | null = null;
    await runTransaction(db, async (transaction) => {
      // Create a new product document reference with an auto-generated ID
      const productsColRef = collection(db, "products");
      productRef = doc(productsColRef); // auto-generated ID
      const metadataRef = doc(db, "metadata", "metadata");

      const metadataResult = await transaction.get(metadataRef);

      // Set the product document with its data and timestamps
      transaction.set(productRef, {
        ...productResult.data,
        searchableFields: generateSearchableFields(productResult.data?.name || "", productResult.data?.sku || ""),
        numericalId: metadataResult.data()?.productsCount + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Add each variation as a document in the "variations" subcollection
      for (const variation of variations) {
        const variationRef = doc(collection(db, "products", productRef.id, "variations"));
        transaction.set(variationRef, variation);
      }

      // Update the metadata document to increment productsCount by 1
      // Assuming the metadata document's ID is "metadata" in the "metadata" collection

      transaction.update(metadataRef, { productsCount: increment(1) });
    });

    const newProduct = productRef ? await getProduct((productRef as DocumentReference).id) : null;
    if (newProduct) {
      await notifyEcommerceProductAdded(newProduct);
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error adding product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const bulkDuplicateProducts = async (productIds: string[], copies: number = 1) => {
  try {
    const products = await Promise.all(productIds.map((id) => getProduct(id)));
    const validProducts = products.filter((p): p is Product => p !== null);

    for (const product of validProducts) {
      for (let i = 0; i < copies; i++) {
        const productData = {
          name: `${product.name} (Copy ${i + 1})`,
          description: product.description,
          image: product.image,
          sku: product.sku,
          weight: product.weight,
          visibility: product.visibility,
        };

        const variations = product.variations.map((v) => ({
          size: v.size,
          colors: v.colors,
        }));

        await addProduct(productData, variations);
      }
    }

    return true;
  } catch (error) {
    console.error("Error duplicating products:", error);
    return false;
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
    // First, get the order documents using a query outside the transaction.
    const ordersQuery = query(collection(db, "orders"), where("product.id", "==", id));
    const ordersSnapshot = await getDocs(ordersQuery);

    await runTransaction(db, async (transaction) => {
      const productRef = doc(db, "products", id);
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) {
        throw new Error("Product not found");
      }

      // Bring each order document into the transaction’s read set.
      const orderDocs = [];
      for (const orderSnap of ordersSnapshot.docs) {
        const orderDoc = await transaction.get(orderSnap.ref);
        orderDocs.push(orderDoc);
      }

      // Update the product document.
      transaction.update(productRef, {
        name: product.name,
        sku: product.sku,
        image: product.image,
        searchableFields: generateSearchableFields(product.name || "", product.sku || ""),
        updatedAt: serverTimestamp(),
      });

      // Update each related order document.
      orderDocs.forEach((orderDoc) => {
        transaction.update(orderDoc.ref, {
          product: {
            id: orderDoc.data()?.product.id,
            name: product.name,
            sku: product.sku,
            image: product.image,
          },
        });
      });
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

    const updatedProduct = await getProduct(id);

    if (updatedProduct) {
      await notifyEcommerceProductUpdated(updatedProduct);
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
    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    await updateDoc(doc(db, "products", id), {
      visibility: !product.visibility,
    });

    await notifyEcommerceProductVisibilityUpdated(product);

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
    await runTransaction(db, async (transaction) => {
      const productRef = doc(db, "products", id);
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) {
        throw new Error("Product not found");
      }

      const variationsRef = collection(productRef, "variations");
      const variationsQuery = await getDocs(variationsRef);
      const variationsBatch = writeBatch(db);
      variationsQuery.docs.forEach((variationDoc) => {
        variationsBatch.delete(variationDoc.ref);
      });
      await variationsBatch.commit();

      const ordersRef = collection(db, "orders");
      const ordersQuery = query(ordersRef, where("product.id", "==", id));
      const ordersQuerySnapshot = await getDocs(ordersQuery);
      const ordersBatch = writeBatch(db);
      ordersQuerySnapshot.docs.forEach((orderDoc) => {
        ordersBatch.delete(orderDoc.ref);
      });
      await ordersBatch.commit();

      transaction.delete(productRef);

      const productData: Product = {
        id: productDoc.id,
        name: productDoc.data()?.name,
        description: productDoc.data()?.description,
        image: productDoc.data()?.image,
        sku: productDoc.data()?.sku,
        weight: productDoc.data()?.weight,
        numericalId: productDoc.data()?.numericalId,
        visibility: productDoc.data()?.visibility,
        variations: productDoc.data()?.variations,
        searchableFields: productDoc.data()?.searchableFields,
        createdAt: productDoc.data()?.createdAt.toDate(),
        updatedAt: productDoc.data()?.updatedAt.toDate(),
      };

      await notifyEcommerceProductDeleted(productData);
    });

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
