import { db } from "@/firebase/config";
import { Order, OrderStatus } from "@/types/order";
import {
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
} from "firebase/firestore";
import { z } from "zod";
import {
  notifyEcommerceOrderAdded,
  notifyEcommerceOrderDeleted,
  notifyEcommerceOrderStatusUpdated,
  notifyEcommerceOrderUpdated,
} from "../notificaiton";

export const addOrderSchema = z.object({
  product: z.object({
    id: z.string(),
    name: z.string(),
    sku: z.string(),
    weight: z.object({
      unit: z.enum(["kg", "g"]).default("g"),
      value: z.string().min(1, { message: "Weight must be at least 1 character" }),
    }),
    image: z.string().optional(),
  }),
  status: z.nativeEnum(OrderStatus),
  orderVariations: z.array(
    z.object({
      size: z.string(),
      color: z.object({
        name: z.string(),
      }),
      quantity: z.number(),
      date: z.string(),
      dispatchDate: z.string().optional(),
      shippedQuantity: z.string().optional(),
      comments: z.string().optional(),
    }),
  ),
});

export const updateOrderSchema = addOrderSchema.extend({
  product: addOrderSchema.shape.product.omit({ weight: true }),
});

export type UpdateOrderType = z.infer<typeof updateOrderSchema>;

export type AddOrderType = z.infer<typeof addOrderSchema>;

export const addOrder = async (order: z.infer<typeof addOrderSchema>) => {
  const result = addOrderSchema.safeParse(order);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    let docRef: DocumentReference<DocumentData, DocumentData> | null = null;
    await runTransaction(db, async (transaction) => {
      const ordersColRef = collection(db, "orders");
      docRef = doc(ordersColRef);
      const metadataRef = doc(db, "metadata", "metadata");

      const metadataResult = await transaction.get(metadataRef);

      transaction.set(docRef, {
        ...result.data,
        numericalId: metadataResult.data()?.ordersCount + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      transaction.update(metadataRef, { ordersCount: increment(1) });
    });

    await notifyEcommerceOrderAdded(result.data);

    return {
      success: true,
      id: docRef ? (docRef as DocumentReference<DocumentData, DocumentData>).id : "",
    };
  } catch (error) {
    console.error("Error adding order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const getTotalOrdersCount = async () => {
  try {
    const totalSnapshot = await getCountFromServer(collection(db, "orders"));
    return totalSnapshot.data().count;
  } catch (error) {
    console.error("Error fetching total orders count:", error);
    return -1;
  }
};

export const updateOrder = async (id: string, order: z.infer<typeof updateOrderSchema>) => {
  const result = updateOrderSchema.safeParse(order);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    await updateDoc(doc(db, "orders", id), {
      ...result.data,
      updatedAt: serverTimestamp(),
    });

    await notifyEcommerceOrderUpdated(result.data);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const getOrder = async (id: string): Promise<Order | null> => {
  try {
    const docSnap = await getDoc(doc(db, "orders", id));
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        product: docSnap.data()?.product,
        status: docSnap.data()?.status,
        numericalId: docSnap.data()?.numericalId,
        orderVariations: docSnap.data()?.orderVariations,
        createdAt: docSnap.data()?.createdAt.toDate().toISOString(),
        updatedAt: docSnap.data()?.updatedAt.toDate().toISOString(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};

export const getOrders = async (
  maxLimit: number = 10,
  pageNumber: number = 1,
  completedOrders = false,
): Promise<{ orders: Order[]; total: number }> => {
  try {
    // First get total count
    const totalSnapshot = await getCountFromServer(collection(db, "orders"));
    const total = totalSnapshot.data().count;

    // Base query
    let queryConstraints: any[] = [
      where("status", "==", completedOrders ? OrderStatus.COMPLETED : OrderStatus.PENDING),
      orderBy("createdAt", "desc"),
      limit(maxLimit),
    ];

    // If it's not the first page, we need all previous pages' last docs
    if (pageNumber > 1) {
      // Get the last doc of the previous page
      const previousPageQuery = query(
        collection(db, "orders"),
        where("status", "==", completedOrders ? OrderStatus.COMPLETED : OrderStatus.PENDING),
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
    const paginatedQuery = query(collection(db, "orders"), ...queryConstraints);
    const querySnapshot = await getDocs(paginatedQuery);

    const orders = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString(),
        updatedAt: doc.data().updatedAt.toDate().toISOString(),
      } as Order;
    });

    return { orders, total };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { orders: [], total: 0 };
  }
};

export const deleteOrder = async (orderId: string) => {
  try {
    const order = await getOrder(orderId);

    if (!order) {
      return false;
    }

    await deleteDoc(doc(db, "orders", orderId));

    await notifyEcommerceOrderDeleted(order);
    return true;
  } catch (error) {
    console.error("Error deleting order:", error);
    return false;
  }
};

export const changeOrderStatus = async (orderId: string, status: OrderStatus) => {
  try {
    const order = await getOrder(orderId);

    if (!order) {
      return false;
    }

    await updateDoc(doc(db, "orders", orderId), {
      status,
      updatedAt: serverTimestamp(),
    });

    await notifyEcommerceOrderStatusUpdated(order);
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    return false;
  }
};

export const changeBulkOrderStatus = async (orderIds: string[], status: OrderStatus) => {
  try {
    await Promise.all(
      orderIds.map(async (orderId) => {
        await changeOrderStatus(orderId, status);
      }),
    );
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    return false;
  }
};

export const deleteBulkOrders = async (orderIds: string[]) => {
  try {
    await Promise.all(
      orderIds.map(async (orderId) => {
        await deleteOrder(orderId);
      }),
    );
    return true;
  } catch (error) {
    console.error("Error deleting orders:", error);
    return false;
  }
};
