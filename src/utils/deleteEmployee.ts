import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

interface SuspendUserResult {
  success: boolean;
  error?: string;
}

export const suspendUserAccount = async (
  uid: string,
  email: string
): Promise<SuspendUserResult> => {
  try {
    // Initialize Firebase services

    const db = getFirestore();

    // Update user document in Firestore to mark as suspended
    const userDocRef = doc(db, "managers", uid);
    await updateDoc(userDocRef, {
      suspended: true,
      suspendedAt: new Date().toISOString(),
      status: "suspended",
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error suspending user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Optional: Add a function to reactivate suspended users
export const reactivateUserAccount = async (
  uid: string,
  email: string
): Promise<SuspendUserResult> => {
  try {
    const db = getFirestore();

    const userDocRef = doc(db, "manager", uid);
    await updateDoc(userDocRef, {
      suspended: false,
      reactivatedAt: new Date().toISOString(),
      status: "active",
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error reactivating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
