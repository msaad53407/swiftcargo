import { collection } from "firebase/firestore";

import {
  getDocs,
  query,
  orderBy,
  deleteDoc,
  limit,
  startAfter,
  where,
  getCountFromServer,
} from "firebase/firestore";
import { toast } from "sonner";
// Define TypeScript interfaces
interface Sender {
  name: string;
  address: string;
  phone: string;
}

interface Receiver {
  name: string;
  address: string;
  phone: string;
}

interface Amount {
  total: number;
  pending: number;
}

interface Package {
  id: string;
  sender: Sender;
  receiver: Receiver;
  invoiceNo: string;
  dateOfAcceptance: string;
  packageWeight: string;
  contentDetail: string;
  paymentStatus: string;
  amount: Amount;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Invoice {
  packageId: string;
  invoiceNo: string;
  status: string;
  receiverName: string;
  paymentStatus: string;
  amount: Amount;
  createdAt: string;
  updatedAt: string;
}

// Assuming we have the same interfaces as before (Package, etc.)

const ITEMS_PER_PAGE = 10;

export const deletePackage = async (db: any, packageId: string) => {
  try {
    // First, get both package and invoice docs that match this packageId
    const packagesRef = collection(db, "packages");
    const invoicesRef = collection(db, "invoices");

    const packageQuery = query(packagesRef, where("id", "==", packageId));
    const invoiceQuery = query(
      invoicesRef,
      where("packageId", "==", packageId)
    );

    const packageDocs = await getDocs(packageQuery);
    const invoiceDocs = await getDocs(invoiceQuery);

    // Delete the package document
    for (const doc of packageDocs.docs) {
      await deleteDoc(doc.ref);
    }

    // Delete the corresponding invoice document
    for (const doc of invoiceDocs.docs) {
      await deleteDoc(doc.ref);
    }

    toast.success("Package deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting package:", error);
    toast.error("Failed to delete package");
    return false;
  }
};

export const bulkDeletePackages = async (db: any, packageIds: string[]) => {
  try {
    const promises = packageIds.map((id) => deletePackage(db, id));
    await Promise.all(promises);

    toast.success(`${packageIds.length} packages deleted successfully`);
    return true;
  } catch (error) {
    console.error("Error in bulk delete:", error);
    toast.error("Failed to delete some packages");
    return false;
  }
};

export const fetchPackagesWithPagination = async (
  db: any,
  page: number = 1,
  itemsPerPage: number = ITEMS_PER_PAGE
) => {
  try {
    const packagesRef = collection(db, "packages");

    // Get total count
    const snapshot = await getCountFromServer(packagesRef);
    const totalItems = snapshot.data().count;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Create query
    const q = query(
      packagesRef,
      orderBy("createdAt", "desc"),
      limit(itemsPerPage)
    );

    // If not first page, need to skip previous items
    if (page > 1) {
      const skipItems = (page - 1) * itemsPerPage;
      const documentsSnapshot = await getDocs(
        query(packagesRef, orderBy("createdAt", "desc"), limit(skipItems))
      );
      const lastVisible =
        documentsSnapshot.docs[documentsSnapshot.docs.length - 1];

      if (lastVisible) {
        const paginatedQuery = query(
          packagesRef,
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(itemsPerPage)
        );
        const paginatedDocs = await getDocs(paginatedQuery);
        return {
          packages: paginatedDocs.docs.map((doc) => doc.data() as Package),
          totalPages,
          currentPage: page,
        };
      }
    }

    const querySnapshot = await getDocs(q);
    return {
      packages: querySnapshot.docs.map((doc) => doc.data() as Package),
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching packages:", error);
    throw error;
  }
};
