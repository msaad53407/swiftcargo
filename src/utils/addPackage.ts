import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { notifyPackageAdded } from "./notificaiton";

// Define TypeScript interfaces
interface Sender {
  name: string;
  // address: string;
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
  cargoFee: number;
  shippingFee: number;
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
  updatedBy?: {
    name: string;
    email: string;
  };
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

// Generate a random 6-digit package ID
const generatePackageId = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Format date to desired string format
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Calculate payment status based on amount
const calculatePaymentStatus = (total: number, pending: number): string => {
  if (pending === 0) return "Paid";
  if (pending === total) return "Unpaid";
  return "Partially Paid";
};

/**
 * Add package and create corresponding invoice
 * @param {Object} rawData - Raw package information
 * @param {Object} db - Firestore database instance
 * @returns {Promise<Object>} - Created package and invoice IDs
 */
export const createPackageWithInvoice = async (
  rawData: any,
  db: any,
  updatedByName: string,
  updatedByEmail: string,
) => {
  try {
    // Generate package ID
    const packageId = generatePackageId();

    const packageData: Package = {
      id: packageId,
      sender: {
        name: rawData.senderName,
        // address: rawData.senderAddress,
        phone: rawData.senderPhone,
      },
      receiver: {
        name: rawData.receiverName,
        address: rawData.receiverAddress,
        phone: rawData.receiverPhone,
      },
      invoiceNo: `#${rawData.invoice}`,
      dateOfAcceptance: formatDate(rawData.dateOfAcceptance),
      packageWeight: `${rawData.packageWeight}Kg`,
      contentDetail: rawData.notes || "",
      amount: {
        total: Number.parseFloat(rawData.totalAmount),
        pending: Number.parseFloat(rawData.dueAmount),
        cargoFee: Number.parseFloat(rawData.cargoFee),
        shippingFee: Number.parseFloat(rawData.shippingFee),
      },
      paymentStatus: calculatePaymentStatus(
        Number.parseFloat(rawData.totalAmount),
        Number.parseFloat(rawData.dueAmount),
      ),
      status: "Accepted",
      updatedBy: {
        name: updatedByName,
        email: updatedByEmail,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add package to packages collection
    const packageRef = collection(db, "packages");
    const packageDoc = await addDoc(packageRef, packageData);

    await notifyPackageAdded(packageDoc.id, packageData.invoiceNo, updatedByName);
    // Prepare invoice data
    const invoiceData: Invoice = {
      packageId,
      invoiceNo: `#${rawData.invoice}`,
      status: "PENDING",
      receiverName: rawData.receiverName,
      paymentStatus: packageData.paymentStatus,
      amount: packageData.amount,
      createdAt: packageData.createdAt,
      updatedAt: packageData.updatedAt,
    };

    // Add invoice to invoices collection
    const invoiceRef = collection(db, "invoices");
    const invoiceDoc = await addDoc(invoiceRef, invoiceData);

    return {
      success: true,
      data: {
        packageId,
        packageDocId: packageDoc.id,
        invoiceDocId: invoiceDoc.id,
        package: packageData,
        invoice: invoiceData,
      },
    };
  } catch (error) {
    console.error("Error creating package and invoice:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
