import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config"; // Adjust this import based on your Firebase config
import { Product } from "@/types/product";

export enum Notifications {
  EMPLOYEE_ADDED = "EMPLOYEE_ADDED",
  PACKAGE_ADDED = "PACKAGE_ADDED",
  PACKAGE_DELETED = "PACKAGE_DELETED",
  PACKAGE_STATUS_UPDATED = "PACKAGE_STATUS_UPDATED",
  INVOICE_GENERATED = "INVOICE_GENERATED",
  ECOMMERCE_PRODUCT_ADDED = "ECOMMERCE_PRODUCT_ADDED",
  ECOMMERCE_PRODUCT_UPDATED = "ECOMMERCE_PRODUCT_UPDATED",
  ECOMMERCE_PRODUCT_DELETED = "ECOMMERCE_PRODUCT_DELETED",
  ECOMMERCE_PRODUCT_VISIBILITY_UPDATED = "ECOMMERCE_PRODUCT_VISIBILITY_UPDATED",
  ECOMMERCE_ORDER_PLACED = "ECOMMERCE_ORDER_PLACED",
  ECOMMERCE_ORDER_STATUS_UPDATED = "ECOMMERCE_ORDER_STATUS_UPDATED",
  ECOMMERCE_ORDER_CANCELLED = "ECOMMERCE_ORDER_CANCELLED",
}

interface NotificationData {
  type: Notifications;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

export async function createNotification({ type, title, description, metadata = {} }: NotificationData) {
  try {
    await addDoc(collection(db, "notifications"), {
      type,
      title,
      description,
      metadata,
      createdAt: serverTimestamp(),
      read: false,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const batch = writeBatch(db);
    const snapshot = await getDocs(collection(db, "notifications"));

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    await deleteDoc(doc(db, "notifications", notificationId));
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
}

// Utility functions for different notification types
export const notifyEmployeeAdded = (employeeName: string) => {
  return createNotification({
    type: Notifications.EMPLOYEE_ADDED,
    title: "New Employee Added",
    description: `${employeeName} has been added to the system`,
    metadata: { employeeName },
  });
};

export const notifyPackageAdded = (packageId: string, invoiceNumber: string, updatedBy: string) => {
  return createNotification({
    type: Notifications.PACKAGE_ADDED,
    title: "New Package Created",
    description: `Package with Invoice No #${invoiceNumber} has been created By ${updatedBy}`,
    metadata: { packageId, invoiceNumber },
  });
};

export const notifyPackageDeleted = (packageId: string, packageName: string) => {
  return createNotification({
    type: Notifications.PACKAGE_DELETED,
    title: "Package Deleted",
    description: `Package ${packageName} has been deleted`,
    metadata: { packageId, packageName },
  });
};

export const notifyPackageStatusUpdated = (
  packageId: string,
  invoiceNumber: string,
  newStatus: string,
  updatedBy: string,
) => {
  return createNotification({
    type: Notifications.PACKAGE_STATUS_UPDATED,
    title: "Package Status Updated",
    description: `Package with Invoice No #${invoiceNumber} status changed to ${newStatus} By ${updatedBy}`,
    metadata: { packageId, invoiceNumber, newStatus },
  });
};

export const notifyEcommerceProductAdded = (product: Product) => {
  return createNotification({
    type: Notifications.ECOMMERCE_PRODUCT_ADDED,
    title: "New Product Added",
    description: `Product ${product.name} has been added`,
    metadata: { product },
  });
};

export const notifyEcommerceProductUpdated = (product: Product) => {
  return createNotification({
    type: Notifications.ECOMMERCE_PRODUCT_UPDATED,
    title: "Product Updated",
    description: `Product ${product.name} has been updated`,
    metadata: { product },
  });
};

export const notifyEcommerceProductDeleted = (product: Product) => {
  return createNotification({
    type: Notifications.ECOMMERCE_PRODUCT_DELETED,
    title: "Product Deleted",
    description: `Product ${product.name} has been deleted`,
    metadata: { product },
  });
};

export const notifyEcommerceProductVisibilityUpdated = (product: Product) => {
  return createNotification({
    type: Notifications.ECOMMERCE_PRODUCT_VISIBILITY_UPDATED,
    title: "Product Visibility Updated",
    description: `Product ${product.name} visibility has been updated from ${product.visibility ? "Visible" : "Hidden"} to ${product.visibility ? "Hidden" : "Visible"}`,
    metadata: { product },
  });
};
