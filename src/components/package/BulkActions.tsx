import React, { useState } from 'react';
import { Trash2, RefreshCw, Loader2, Printer, Copy, DollarSign } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { addDoc, collection, getDocs, query, updateDoc, where } from "firebase/firestore"
import { bulkDeletePackages } from '@/utils/packageUtils';
import { notifyPackageAdded, notifyPackageStatusUpdated } from '@/utils/notificaiton';
import { handleBulkPrint } from './BulkPkgPrintButton';
import { Input } from '../ui/input';
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



const generatePackageId = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


export const bulkUpdatePackageStatus = async (db, packageIds, newStatus, updatedBy) => {
    try {
        const packagesRef = collection(db, "packages");

        // First, fetch all package documents to get their invoice numbers
        const packagesData = await Promise.all(packageIds.map(async (id) => {
            const q = query(packagesRef, where("id", "==", id));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                return {
                    id,
                    docRef: querySnapshot.docs[0].ref,
                    invoiceNo: querySnapshot.docs[0].data().invoiceNo
                };
            }
            return null;
        }));

        // Filter out any null values (packages not found)
        const validPackages = packagesData.filter(pkg => pkg !== null);

        // Update packages and send notifications
        const updatePromises = validPackages.map(async (pkg) => {
            // Update the package
            await updateDoc(pkg.docRef, {
                status: newStatus,
                updatedAt: new Date().toISOString(),
                updatedBy: {
                    name: updatedBy.name || '',
                    email: updatedBy.email || ''
                }
            });

            // Send notification
            await notifyPackageStatusUpdated(
                pkg.id,
                pkg.invoiceNo,
                newStatus,
                updatedBy.name || ''
            );
        });

        await Promise.all(updatePromises);
        toast.success(`Status updated for ${validPackages.length} packages`);
        return true;
    } catch (error) {
        console.error("Error in bulk status update:", error);
        toast.error("Failed to update status for some packages");
        return false;
    }
};

export function StatusUpdateModal({
    isOpen,
    onClose,
    onConfirm,
    packageCount,
    isLoading
}) {
    const [selectedStatus, setSelectedStatus] = useState("");

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle>Update Package Status</DialogTitle>
                    <DialogDescription>
                        Update status for {packageCount} selected packages
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Select New Status</Label>
                        <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Accepted">Accepted</SelectItem>
                                <SelectItem value="arrived-at-tash-airport">Arrived at Tash Airport</SelectItem>
                                <SelectItem value="departed-from-tash-airport">Departed from Tash Airport</SelectItem>
                                <SelectItem value="arrived-at-jfk-airport">Arrived at JFK Airport</SelectItem>
                                <SelectItem value="picked-up-from-jfk-airport">Picked up from JFK Airport</SelectItem>
                                <SelectItem value="available-for-pick-up">Available for pick up</SelectItem>
                                <SelectItem value="shipped-to-receivers-destination">Shipped to Receiver's destination</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onConfirm(selectedStatus)}
                        disabled={!selectedStatus || isLoading}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            'Update Status'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export const bulkDuplicatePackages = async (db, packages, currentUser) => {
    try {
        const packagesRef = collection(db, "packages");
        const invoicesRef = collection(db, "invoices");

        const duplicatePromises = packages.map(async (originalPkg) => {
            // Generate new package ID
            const newPackageId = generatePackageId();

            // Create new invoice number (original + -COPY + random 4 digits)
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const newInvoiceNo = `${originalPkg.invoiceNo}-COPY-${randomSuffix}`;

            // Create new package data
            const packageData: Package = {
                id: newPackageId,
                sender: { ...originalPkg.sender },
                receiver: { ...originalPkg.receiver },
                invoiceNo: originalPkg?.invoiceNo,
                dateOfAcceptance: originalPkg.dateOfAcceptance,
                packageWeight: originalPkg.packageWeight,
                contentDetail: originalPkg.contentDetail,
                amount: { ...originalPkg.amount },
                paymentStatus: originalPkg.paymentStatus,
                status: "Accepted", // Reset status to Accepted for new package
                updatedBy: {
                    name: currentUser?.name || '',
                    email: currentUser?.email || ''
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // Add new package
            const packageDoc = await addDoc(packagesRef, packageData);

            // Notify package creation
            await notifyPackageAdded(
                packageDoc.id,
                packageData.invoiceNo,
                currentUser?.name || ''
            );

            // Create corresponding invoice
            const invoiceData: Invoice = {
                packageId: newPackageId,
                invoiceNo: originalPkg?.invoiceNo,
                status: "PENDING",
                receiverName: originalPkg.receiver.name,
                paymentStatus: packageData.paymentStatus,
                amount: packageData.amount,
                createdAt: packageData.createdAt,
                updatedAt: packageData.updatedAt,
            };

            // Add new invoice
            await addDoc(invoicesRef, invoiceData);

            return packageData;
        });

        await Promise.all(duplicatePromises);
        toast.success(`Successfully duplicated ${packages.length} packages`);
        return true;
    } catch (error) {
        console.error("Error in bulk duplication:", error);
        toast.error("Failed to duplicate packages");
        return false;
    }
};

export const bulkUpdatePendingAmount = async (db, packageIds, newPendingAmount, updatedBy) => {
    try {
        const packagesRef = collection(db, "packages");

        const updatePromises = packageIds.map(async (id) => {
            const q = query(packagesRef, where("id", "==", id));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                const currentData = querySnapshot.docs[0].data();
                const total = currentData.amount.total;

                // Calculate new payment status
                const paymentStatus = calculatePaymentStatus(total, Number(newPendingAmount));

                await updateDoc(docRef, {
                    "amount.pending": Number(newPendingAmount),
                    paymentStatus,
                    updatedAt: new Date().toISOString(),
                    updatedBy: {
                        name: updatedBy.name || '',
                        email: updatedBy.email || ''
                    }
                });

                // Update corresponding invoice if it exists
                const invoicesRef = collection(db, "invoices");
                const invoiceQuery = query(invoicesRef, where("packageId", "==", id));
                const invoiceSnapshot = await getDocs(invoiceQuery);

                if (!invoiceSnapshot.empty) {
                    const invoiceRef = invoiceSnapshot.docs[0].ref;
                    await updateDoc(invoiceRef, {
                        "amount.pending": Number(newPendingAmount),
                        paymentStatus,
                        updatedAt: new Date().toISOString()
                    });
                }
            }
        });

        await Promise.all(updatePromises);
        toast.success(`Updated pending amount for ${packageIds.length} packages`);
        return true;
    } catch (error) {
        console.error("Error updating pending amounts:", error);
        toast.error("Failed to update pending amounts");
        return false;
    }
};

const calculatePaymentStatus = (total: number, pending: number): string => {
    if (pending === 0) return "Paid";
    if (pending === total) return "Unpaid";
    return "Partially Paid";
};

// New component for pending amount modal
export function PendingAmountModal({
    isOpen,
    onClose,
    onConfirm,
    packageCount,
    isLoading
}) {
    const [pendingAmount, setPendingAmount] = useState("");

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle>Update Pending Amount</DialogTitle>
                    <DialogDescription>
                        Update pending amount for {packageCount} selected packages
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>New Pending Amount</Label>
                        <Input
                            type="number"
                            value={pendingAmount}
                            onChange={(e) => setPendingAmount(e.target.value)}
                            placeholder="Enter new pending amount"
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onConfirm(pendingAmount)}
                        disabled={!pendingAmount || isLoading}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            'Update Amount'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function BulkActions({
    selectedPackages,
    onBulkAction,
    currentUser,
    db,
    loadPackages,
    currentPage,
    packages
}) {
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isPendingAmountModalOpen, setIsPendingAmountModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAction, setSelectedAction] = useState('');

    const handleBulkAction = async (action: string) => {
        if (!selectedPackages.length) {
            toast.error("Please select at least 1 package");
            return;
        }

        setSelectedAction(action);

        switch (action) {
            case 'delete':
                if (window.confirm(`Are you sure you want to delete ${selectedPackages.length} packages?`)) {
                    const success = await bulkDeletePackages(db, selectedPackages);
                    if (success) {
                        loadPackages(currentPage);
                        onBulkAction([]);
                    }
                }
                break;
            case 'updateStatus':
                setIsStatusModalOpen(true);
                break;
            case 'duplicate': {
                if (window.confirm(`Are you sure you want to duplicate ${selectedPackages.length} packages?`)) {
                    // Filter the full package data to get only selected packages
                    const selectedPackageData = packages.filter(pkg =>
                        selectedPackages.includes(pkg.id)
                    );
                    const success = await bulkDuplicatePackages(db, selectedPackageData, currentUser);
                    if (success) {
                        loadPackages(currentPage);
                        onBulkAction([]);
                    }
                }
                break;
            }
            case 'updatePendingAmount':
                setIsPendingAmountModalOpen(true);
                break;
            case 'print': {
                const selectedPackageData = packages.filter(pkg =>
                    selectedPackages.includes(pkg.id)
                );
                handleBulkPrint(selectedPackageData);
                break;
            }
        }
    };

    const handlePendingAmountUpdate = async (newAmount: string) => {
        setIsLoading(true);
        try {
            const success = await bulkUpdatePendingAmount(
                db,
                selectedPackages,
                newAmount,
                {
                    name: currentUser?.name || '',
                    email: currentUser?.email || ''
                }
            );

            if (success) {
                loadPackages(currentPage);
                onBulkAction([]);
                setIsPendingAmountModalOpen(false);
            }
        } finally {
            setIsLoading(false);
        }
    };


    const handleStatusUpdate = async (newStatus: string) => {
        setIsLoading(true);
        try {
            const success = await bulkUpdatePackageStatus(
                db,
                selectedPackages,
                newStatus,
                {
                    name: currentUser?.name || '',
                    email: currentUser?.email || ''
                }
            );

            if (success) {
                loadPackages(currentPage);
                onBulkAction([]);
                setIsStatusModalOpen(false);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getButtonLabel = () => {
        switch (selectedAction) {
            case 'delete':
                return 'Delete Selected';
            case 'updateStatus':
                return 'Update Status';
            default:
                return 'Apply';
        }
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <Select onValueChange={handleBulkAction}>
                    <SelectTrigger className="w-full sm:w-[230px]">
                        <SelectValue placeholder="Bulk Action" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="delete" className="text-red-500">
                            <div className="flex items-center gap-2">
                                <Trash2 className="h-4 w-4 text-red-500" />
                                <span>Delete Selected</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="updateStatus">
                            <div className="flex items-center gap-2">
                                <RefreshCw className="h-4 w-4" />
                                <span>Update Status</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="duplicate">
                            <div className="flex items-center gap-2">
                                <Copy className="h-4 w-4" />
                                <span>Duplicate Packages</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="updatePendingAmount">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                <span>Update Pending Amount</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="print">
                            <div className="flex items-center gap-2">
                                <Printer className="h-4 w-4" />
                                <span>Print Selected</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction(selectedAction)}
                    disabled={isLoading || !selectedAction}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Applying...
                        </>
                    ) : (
                        getButtonLabel()
                    )}
                </Button>
            </div>

            <StatusUpdateModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onConfirm={handleStatusUpdate}
                packageCount={selectedPackages.length}
                isLoading={isLoading}
            />
            <PendingAmountModal
                isOpen={isPendingAmountModalOpen}
                onClose={() => setIsPendingAmountModalOpen(false)}
                onConfirm={handlePendingAmountUpdate}
                packageCount={selectedPackages.length}
                isLoading={isLoading}
            />
        </>
    );
}
