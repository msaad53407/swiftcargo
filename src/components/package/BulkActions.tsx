import React, { useState } from 'react';
import { Trash2, RefreshCw, Loader2 } from 'lucide-react';
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
import { collection, getDocs, query, updateDoc, where } from "firebase/firestore"
import { bulkDeletePackages } from '@/utils/packageUtils';
import { notifyPackageStatusUpdated } from '@/utils/notificaiton';

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
            <DialogContent className="sm:max-w-[425px]">
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
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onConfirm(selectedStatus)}
                        disabled={!selectedStatus || isLoading}
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

export function BulkActions({
    selectedPackages,
    onBulkAction,
    currentUser,
    db,
    loadPackages,
    currentPage
}) {
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleBulkAction = async (action: string) => {
        if (!selectedPackages.length) {
            toast.error("Please select at least 1 package");
            return;
        }

        if (action === 'delete') {
            if (window.confirm(`Are you sure you want to delete ${selectedPackages.length} packages?`)) {
                const success = await bulkDeletePackages(db, selectedPackages);
                if (success) {
                    loadPackages(currentPage);
                    onBulkAction([]);
                }
            }
        } else if (action === 'updateStatus') {
            setIsStatusModalOpen(true);
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
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('updateStatus')}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Applying...
                        </>
                    ) : (
                        'Apply'
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
        </>
    );
}