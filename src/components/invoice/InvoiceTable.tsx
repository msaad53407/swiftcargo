"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, ChevronLeft, ChevronRight, Search, Settings2 } from 'lucide-react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { db } from "../../firebase/config.js"
import { fetchInvoicesWithPagination } from "@/utils/invoiceUtils"
import Loader from "../Loader.js"
import { InvoiceDetails } from "./InvoiceDetails .js"

interface Payment {
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



export function PaymentTable() {
    const [selectedPayments, setSelectedPayments] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [invoiceId, setInvoiceId] = useState<string | null>(null);

    const loadInvoices = async (page: number = currentPage) => {
        try {
            setLoading(true);
            const result = await fetchInvoicesWithPagination(db, page);

            setPayments(result.invoices);

            setTotalPages(result.totalPages);
            setCurrentPage(result.currentPage);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching packages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvoices();
    }, []);
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            loadInvoices(page);
        }
    };

    // Generate pagination array
    const getPaginationArray = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };



    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedPayments(payments.map((payment) => payment.id))
        } else {
            setSelectedPayments([])
        }
    }

    const handleSelect = (id: string) => {
        if (selectedPayments.includes(id)) {
            setSelectedPayments(selectedPayments.filter((paymentId) => paymentId !== id))
        } else {
            setSelectedPayments([...selectedPayments, id])
        }
    }

    const getStatusColor = (status: Payment["status"]) => {
        switch (status) {
            case "Delivered":
                return "text-green-600"
            case "on Hold":
                return "text-yellow-600"
            case "on the way":
                return "text-blue-600"
            default:
                return "text-gray-600"
        }
    }

    const getStatusDot = (status: Payment["status"]) => {
        switch (status) {
            case "Delivered":
                return "bg-green-600"
            case "on Hold":
                return "bg-yellow-600"
            case "on the way":
                return "bg-blue-600"
            default:
                return "bg-gray-600"
        }
    }
    if (loading) {
        return <Loader />
    }



    const handleViewDetails = (invoiceId: string) => {
        setInvoiceId(invoiceId);
    };
    const handleBackToTable = () => {
        loadInvoices()
        setInvoiceId(null);
    };
    if (invoiceId) {
        return (
            <div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToTable}
                    className="mb-4"
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to invoices
                </Button>
                <InvoiceDetails invoiceId={invoiceId} />
            </div>
        );
    }
    return (
        <div className="space-y-4">


            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[50px] whitespace-nowrap">
                                <Checkbox
                                    checked={selectedPayments.length === payments.length}
                                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                />
                            </TableHead>
                            <TableHead className="whitespace-nowrap">Package id</TableHead>
                            <TableHead className="whitespace-nowrap">Date</TableHead>
                            <TableHead className="whitespace-nowrap">Status</TableHead>
                            <TableHead className="whitespace-nowrap">Customer</TableHead>
                            <TableHead className="whitespace-nowrap">Payment Detail</TableHead>
                            <TableHead className="whitespace-nowrap">Total</TableHead>
                            <TableHead className="w-[50px] whitespace-nowrap">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.map((payment) => (
                            <TableRow key={payment.packageId}>
                                <TableCell className="whitespace-nowrap p-4">
                                    <Checkbox
                                        checked={selectedPayments.includes(payment.packageId)}
                                        onCheckedChange={() => handleSelect(payment.packageId)}
                                    />
                                </TableCell>
                                <TableCell className="font-medium whitespace-nowrap p-4">{payment.packageId}</TableCell>
                                <TableCell className="whitespace-nowrap p-4">{payment.createdAt}</TableCell>
                                <TableCell className="whitespace-nowrap p-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${getStatusDot(payment.status)}`} />
                                        <span className={getStatusColor(payment.status)}>{payment.status}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="whitespace-nowrap p-4">{payment.receiverName}</TableCell>
                                <TableCell className="whitespace-nowrap p-4">{payment.paymentStatus}</TableCell>
                                <TableCell className="whitespace-nowrap p-4">$ {payment.amount.total}</TableCell>
                                <TableCell className="whitespace-nowrap p-4">
                                    <Button onClick={() => handleViewDetails(payment.packageId)} variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="flex items-center justify-between border-t px-4 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <div className="flex items-center gap-1">
                        {getPaginationArray().map((page, i) => (
                            <Button
                                key={i}
                                variant={page === currentPage ? "default" : "ghost"}
                                size="icon"
                                className={`h-8 w-8 ${typeof page !== "number" ? "cursor-default" : ""}`}
                                disabled={typeof page !== "number"}
                                onClick={() => typeof page === "number" && handlePageChange(page)}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

        </div>
    )
}

