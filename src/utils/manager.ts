// src/utils/manager.ts
import {
  collection,
  getDocs,
  query,
  where,
  DocumentData,
} from "firebase/firestore";
import { db } from "../firebase/config.js";

export interface Manager {
  name: string;
  email: string;
  department: string;
  designation: string;
  phone: string;
  address: string;
  userType: "manager";
  uid: string;
  createdAt: Date;
  suspended: boolean;
}

export const fetchManagers = async (): Promise<Manager[]> => {
  try {
    const managersRef = collection(db, "managers");
    const managersSnapshot = await getDocs(managersRef);

    return managersSnapshot.docs.map((doc) => {
      const data = doc.data();
      // Convert Firestore Timestamp to Date
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
      } as Manager;
    });
  } catch (error) {
    console.error("Error fetching managers:", error);
    throw new Error("Failed to fetch managers");
  }
};

// Utility to fetch a single manager by email
export const fetchManagerByEmail = async (
  email: string
): Promise<Manager | null> => {
  try {
    const managersRef = collection(db, "managers");
    const q = query(managersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const data = querySnapshot.docs[0].data();
    return {
      ...data,
      createdAt: data.createdAt.toDate(),
    } as Manager;
  } catch (error) {
    console.error("Error fetching manager:", error);
    throw new Error("Failed to fetch manager information");
  }
};
