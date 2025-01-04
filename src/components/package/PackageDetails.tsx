"use client"

import { useState, useEffect } from "react"
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore"
import { db } from "../../firebase/config.js"
import { MoreHorizontal } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { notifyPackageStatusUpdated } from "@/utils/notificaiton.js"
import Loader from "../Loader.js"

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

interface PackageDetailsProps {
    packageId: string;
}

export function PackageDetails({ packageId }: PackageDetailsProps) {
    const [packageData, setPackageData] = useState<Package | null>(null)
    const [status, setStatus] = useState<string>("")
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const fetchPackageData = async () => {
        try {
            // Reference to the 'packages' collection
            const packagesCollectionRef = collection(db, "packages");

            // Query to find the document where packageId matches the provided ID
            const q = query(packagesCollectionRef, where("id", "==", packageId));

            // Execute the query
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Assuming there's only one match; handle multiple matches if needed
                const doc = querySnapshot.docs[0];
                const data = doc.data();

                setPackageData(data);
                setStatus(data.status || "");
            } else {
                console.warn("No package found with this packageId.");
                // Optionally add your toast or error handling here
            }
        } catch (error) {
            console.error("Error fetching package data:", error);
            // Optionally add your toast or error handling here
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {

        fetchPackageData();
    }, [packageId]);

    const handleSave = async () => {
        if (!packageData) return;

        setIsSaving(true);
        try {
            // Reference to the 'packages' collection
            const packagesCollectionRef = collection(db, "packages");

            // Query to find the document where packageId matches the provided ID
            const q = query(packagesCollectionRef, where("id", "==", packageId));

            // Execute the query
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Assuming there's only one match; handle multiple matches if necessary
                const doc = querySnapshot.docs[0];
                const docRef = doc.ref; // Get the document reference

                // Update the document
                await updateDoc(docRef, {
                    status,
                    updatedAt: new Date().toISOString(),
                });
                await notifyPackageStatusUpdated(packageId, packageData.invoiceNo, status)

                toast.success("Package status updated successfully.")

                // Add your toast here
            } else {
                console.warn("No package found to update with this packageId.");
                // Optionally add your toast or error handling here
                toast.error("No package found to update with this packageId.")
            }
        } catch (error) {
            console.error("Error updating package status:", error);
            toast.error(`Error updating package status: ${error}`)
            // Optionally add your toast or error handling here
        } finally {
            setIsSaving(false);
        }
    };


    if (isLoading) {
        return <Loader />
    }

    if (!packageData) {
        return <div>No package data found</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle>Package Information</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Basic info, like your name and address, that you use on package for delivery
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Invoice No</Label>
                                <p className="font-medium">{packageData.invoiceNo}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Sender Name</Label>
                                <p className="font-medium">{packageData.sender.name}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Mobile Number</Label>
                                <p className="font-medium">{packageData.sender.phone}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Address From</Label>
                                <p className="font-medium">{packageData.sender.address}</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Recipient Name</Label>
                                <p className="font-medium">{packageData.receiver.name}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Mobile Number</Label>
                                <p className="font-medium">{packageData.receiver.phone}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Address To</Label>
                                <p className="font-medium">{packageData.receiver.address}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-4">
                    <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Date of Acceptance</Label>
                                <p className="font-medium">{packageData.dateOfAcceptance}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Package Weight</Label>
                                <p className="font-medium">{packageData.packageWeight}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Delivery Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="accepted">Accepted</SelectItem>
                                        <SelectItem value="arrived-at-tash-airport">Arrived at Tash Airport</SelectItem>
                                        <SelectItem value="departed-from-tash-airport">Departed from Tash Airport</SelectItem>
                                        <SelectItem value="arrived-at-jfk-airport">Arrived at JFK Airport</SelectItem>
                                        <SelectItem value="picked-up-from-jfk-airport">Picked up from JFK Airport</SelectItem>
                                        <SelectItem value="available-for-pick-up">Available for pick up</SelectItem>
                                        <SelectItem value="shipped-to-receivers-destination">Shipped to Receiver’s destination</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Content Detail</Label>
                                <p className="font-medium">{packageData.contentDetail}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Payment Status</Label>
                                <p className="font-medium">{packageData.paymentStatus}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Total Amount</Label>
                                <p className="font-medium">${packageData.amount.total}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Pending Amount</Label>
                                <p className="font-medium">${packageData.amount.pending}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-start">
                <Button

                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            <span>Saving...</span>
                        </div>
                    ) : (
                        "Save"
                    )}
                </Button>
            </div>
        </div>
    )
}

