import { collection, getDocs, query, orderBy } from "firebase/firestore";

// Types from previous implementation
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
}

/**
 * Fetch all packages from Firebase
 * @param {Object} db - Firestore database instance
 * @returns {Promise<Package[]>} Array of packages
 */
export const fetchAllPackages = async (db: any): Promise<Package[]> => {
  try {
    const packagesRef = collection(db, "packages");
    // Query to order packages by creation date, newest first
    const q = query(packagesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const packages: Package[] = [];

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      // Format the data to match the required interface
      packages.push({
        id: data.id,
        sender: data.sender,
        receiver: data.receiver,
        invoiceNo: data.invoiceNo,
        dateOfAcceptance: data.dateOfAcceptance,
        packageWeight: data.packageWeight,
        contentDetail: data.contentDetail,
        paymentStatus: data.paymentStatus,
        amount: data.amount,
        status: data.status,
      });
    }

    return packages;
  } catch (error) {
    console.error("Error fetching packages:", error);
    throw error;
  }
};
