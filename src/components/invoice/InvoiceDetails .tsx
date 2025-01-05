"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, updateDoc, where } from "firebase/firestore"
import { db } from "../../firebase/config.js"
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
import Loader from "../Loader.js"

interface Invoice {
    invoiceNo: string;
    status: string;
    amount: {
        pending: number;
        total: number;
    };
    createdAt: string;
    paymentStatus: string;
    packageId: string;
    updatedAt: string;
    receiverName: string;
}

interface InvoiceDetailsProps {
    invoiceId: string;
}

export function InvoiceDetails({ invoiceId }: InvoiceDetailsProps) {
    const [invoiceData, setInvoiceData] = useState<Invoice | null>(null)
    const [status, setStatus] = useState<string>("")
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const fetchInvoiceData = async () => {
        try {
            const invoicesCollectionRef = collection(db, "invoices");
            const q = query(invoicesCollectionRef, where("packageId", "==", invoiceId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const data = doc.data() as Invoice;
                setInvoiceData(data);
                console.log("data", data)
                setStatus(data.status || "");
            } else {
                console.warn("No invoice found with this invoiceId.");
                toast.error("Invoice not found");
            }
        } catch (error) {
            console.error("Error fetching invoice data:", error);
            toast.error("Failed to load invoice data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoiceData();
    }, [invoiceId]);

    const handleSave = async () => {
        if (!invoiceData) return;

        setIsSaving(true);
        try {
            const invoicesCollectionRef = collection(db, "invoices");
            const q = query(invoicesCollectionRef, where("packageId", "==", invoiceId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const docRef = doc.ref;

                await updateDoc(docRef, {
                    status,
                    updatedAt: new Date().toISOString(),
                });

                toast.success("Invoice status updated successfully");
            } else {
                toast.error("No invoice found to update");
            }
        } catch (error) {
            console.error("Error updating invoice status:", error);
            toast.error("Failed to update invoice status");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <Loader />
    }

    if (!invoiceData) {
        return <div>No invoice data found</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle>Invoice Information</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Invoice details including payment status
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Invoice Number</Label>
                                <p className="font-medium">{invoiceData.invoiceNo}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Receiver Name</Label>
                                <p className="font-medium">{invoiceData.receiverName}</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Created At</Label>
                                <p className="font-medium">{new Date(invoiceData.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Updated At</Label>
                                <p className="font-medium">{new Date(invoiceData.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-4">
                    <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Payment Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* <SelectItem value="draft">Draft</SelectItem> */}
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="overdue">Overdue</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Pending Amount</Label>
                                <p className="font-medium">${invoiceData.amount.pending}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Total Amount</Label>
                                <p className="font-medium">${invoiceData.amount.total}</p>
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
