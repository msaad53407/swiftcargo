import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  getCountFromServer,
} from "firebase/firestore";

// Define TypeScript interfaces for invoices
interface Invoice {
  packageId: string;
  invoiceNo: string;
  status: string;
  receiverName: string;
  paymentStatus: string;
  amount: {
    total: number;
    pending: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface PaginatedInvoiceResponse {
  invoices: Invoice[];
  totalPages: number;
  currentPage: number;
}

const ITEMS_PER_PAGE = 10;

/**
 * Fetch all invoices without pagination
 */
export const fetchAllInvoices = async (db: any): Promise<Invoice[]> => {
  try {
    const invoicesRef = collection(db, "invoices");
    const q = query(invoicesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => doc.data() as Invoice);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
};

/**
 * Fetch invoices with pagination
 */
export const fetchInvoicesWithPagination = async (
  db: any,
  page: number = 1,
  itemsPerPage: number = ITEMS_PER_PAGE
): Promise<PaginatedInvoiceResponse> => {
  try {
    const invoicesRef = collection(db, "invoices");

    // Get total count for pagination
    const snapshot = await getCountFromServer(invoicesRef);
    const totalItems = snapshot.data().count;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Create base query
    const q = query(
      invoicesRef,
      orderBy("createdAt", "desc"),
      limit(itemsPerPage)
    );

    // Handle pagination
    if (page > 1) {
      const skipItems = (page - 1) * itemsPerPage;
      const documentsSnapshot = await getDocs(
        query(invoicesRef, orderBy("createdAt", "desc"), limit(skipItems))
      );
      const lastVisible =
        documentsSnapshot.docs[documentsSnapshot.docs.length - 1];

      if (lastVisible) {
        const paginatedQuery = query(
          invoicesRef,
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(itemsPerPage)
        );
        const paginatedDocs = await getDocs(paginatedQuery);
        return {
          invoices: paginatedDocs.docs.map((doc) => doc.data() as Invoice),
          totalPages,
          currentPage: page,
        };
      }
    }

    const querySnapshot = await getDocs(q);
    return {
      invoices: querySnapshot.docs.map((doc) => doc.data() as Invoice),
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching invoices with pagination:", error);
    throw error;
  }
};

/**
 * Fetch a single invoice by packageId
 */
export const fetchInvoiceByPackageId = async (
  db: any,
  packageId: string
): Promise<Invoice | null> => {
  try {
    const invoicesRef = collection(db, "invoices");
    const q = query(invoicesRef, where("packageId", "==", packageId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as Invoice;
  } catch (error) {
    console.error("Error fetching invoice by package ID:", error);
    throw error;
  }
};

/**
 * Fetch invoices by status
 */
export const fetchInvoicesByStatus = async (
  db: any,
  status: string
): Promise<Invoice[]> => {
  try {
    const invoicesRef = collection(db, "invoices");
    const q = query(
      invoicesRef,
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Invoice);
  } catch (error) {
    console.error("Error fetching invoices by status:", error);
    throw error;
  }
};

/**
 * Fetch invoices by payment status
 */
export const fetchInvoicesByPaymentStatus = async (
  db: any,
  paymentStatus: string
): Promise<Invoice[]> => {
  try {
    const invoicesRef = collection(db, "invoices");
    const q = query(
      invoicesRef,
      where("paymentStatus", "==", paymentStatus),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Invoice);
  } catch (error) {
    console.error("Error fetching invoices by payment status:", error);
    throw error;
  }
};
