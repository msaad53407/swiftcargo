import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  Notifications,
} from "@/utils/notificaiton";

export interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: any;
  read: boolean;
  metadata: Record<string, any>;
}

export function useEcommerceNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const filterQuery = Object.values(Notifications).filter((n) => n.includes("ECOMMERCE"));

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"), where("type", "in", filterQuery));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, []);

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  return {
    notifications,
    unreadCount,
    readCount,
    handleMarkAllAsRead,
    handleMarkAsRead,
    handleDelete,
  };
}
