import { addDoc, collection, serverTimestamp, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase/config.ts"; // Adjust this import based on your Firebase config

type NotificationType =
  | "EMPLOYEE_ADDED"
  | "PACKAGE_ADDED"
  | "PACKAGE_DELETED"
  | "PACKAGE_STATUS_UPDATED"
  | "INVOICE_GENERATED";

interface NotificationData {
  type: NotificationType;
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
    const snapshot = await collection(db, "notifications").get();

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
    type: "EMPLOYEE_ADDED",
    title: "New Employee Added",
    description: `${employeeName} has been added to the system`,
    metadata: { employeeName },
  });
};

export const notifyPackageAdded = (packageId: string, invoiceNumber: string, updatedBy: string) => {
  return createNotification({
    type: "PACKAGE_ADDED",
    title: "New Package Created",
    description: `Package with Invoice No #${invoiceNumber} has been created By ${updatedBy}`,
    metadata: { packageId, invoiceNumber },
  });
};

export const notifyPackageDeleted = (packageId: string, packageName: string) => {
  return createNotification({
    type: "PACKAGE_DELETED",
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
    type: "PACKAGE_STATUS_UPDATED",
    title: "Package Status Updated",
    description: `Package with Invoice No #${invoiceNumber} status changed to ${newStatus} By ${updatedBy}`,
    metadata: { packageId, invoiceNumber, newStatus },
  });
};
