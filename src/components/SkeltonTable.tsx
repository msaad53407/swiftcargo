import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const TableSkeleton = () => {
    // Create an array of 5 items to represent loading rows
    const loadingRows = Array(2).fill(null);

    return (
        <div className="space-y-4">
            {/* Header Actions Skeleton */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-[130px]" />
                    <Skeleton className="h-10 w-[70px]" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-[250px]" />
                    <Skeleton className="h-10 w-[100px]" />
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[50px]">
                                <Skeleton className="h-4 w-4" />
                            </TableHead>
                            <TableHead>Employee</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Verified</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loadingRows.map((_, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Skeleton className="h-4 w-4" />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div>
                                            <Skeleton className="h-4 w-[150px]" />
                                            <Skeleton className="mt-1 h-3 w-[120px]" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <Skeleton className="h-4 w-[100px]" />
                                        <Skeleton className="mt-1 h-3 w-[80px]" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-[120px]" />
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-1">
                                            <Skeleton className="h-6 w-6 rounded-full" />
                                            <Skeleton className="h-4 w-[40px]" />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Skeleton className="h-6 w-6 rounded-full" />
                                            <Skeleton className="h-4 w-[40px]" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-6 w-[80px] rounded-full" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-8 w-8" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Pagination Skeleton */}
                <div className="flex items-center justify-between border-t px-4 py-4">
                    <Skeleton className="h-8 w-[100px]" />
                    <div className="flex items-center gap-1">
                        {Array(7).fill(null).map((_, i) => (
                            <Skeleton key={i} className="h-8 w-8" />
                        ))}
                    </div>
                    <Skeleton className="h-8 w-[100px]" />
                </div>
            </div>
        </div>
    );
};

export default TableSkeleton;