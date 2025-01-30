import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { toast } from "sonner";
import { Policy } from "@/types/policy";

export const addPolicy = async (title: string, content: string): Promise<boolean> => {
  try {
    await addDoc(collection(db, "policies"), {
      title,
      content,
      lastUpdated: serverTimestamp(),
      isActive: false,
    });
    toast.success("Policy added successfully");
    return true;
  } catch (error) {
    toast.error("Failed to add policy");
    return false;
  }
};

export const updatePolicy = async (id: string, data: Partial<Policy>): Promise<boolean> => {
  try {
    const policyRef = doc(db, "policies", id);
    await updateDoc(policyRef, {
      ...data,
      lastUpdated: serverTimestamp(),
    });
    toast.success("Policy updated successfully");
    return true;
  } catch (error) {
    toast.error("Failed to update policy");
    return false;
  }
};

export const deletePolicy = async (id: string): Promise<boolean> => {
  try {
    const policyRef = doc(db, "policies", id);
    await deleteDoc(policyRef);
    toast.success("Policy deleted successfully");
    return true;
  } catch (error) {
    toast.error("Failed to delete policy");
    return false;
  }
};

export const getPolicies = async (): Promise<Policy[]> => {
  try {
    const q = query(collection(db, "policies"), orderBy("lastUpdated", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      lastUpdated: doc.data().lastUpdated?.toDate(),
    })) as Policy[];
  } catch (error) {
    toast.error("Failed to fetch policies");
    return [];
  }
};

export const setActivePolicy = async (id: string): Promise<boolean> => {
  try {
    // First, deactivate all policies
    const policies = await getPolicies();
    await Promise.all(policies.map((policy) => updateDoc(doc(db, "policies", policy.id), { isActive: false })));

    // Then activate the selected policy
    const policyRef = doc(db, "policies", id);
    await updateDoc(policyRef, { isActive: true });
    toast.success("Active policy updated");
    return true;
  } catch (error) {
    toast.error("Failed to update active policy");
    return false;
  }
};
