"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, ChevronLeft, ChevronRight, Search, Settings2, Phone, MapPin, Trash2 } from 'lucide-react'
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
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchAllPackages } from "@/utils/getPackages"
import { db } from "../../firebase/config.js"
import { bulkDeletePackages, deletePackage, fetchPackagesWithPagination } from "@/utils/packageUtils.js"
import { PackageDetails } from "./PackageDetails.js"
import TableSkeleton from "../SkeltonTable.js"
import Loader from "../Loader.js"
import * as Papa from "papaparse";
import { useAuth } from "@/contexts/AuthContext.js"
import FilterPopover, { FilterValues } from "../package/filter-popover.js"

interface Package {
  id: string
  sender: {
    name: string
    address: string
    phone: string
  }
  receiver: {
    name: string
    address: string
    phone: string
  }
  invoiceNo: string
  dateOfAcceptance: string
  packageWeight: string
  contentDetail: string
  paymentStatus: "Paid" | "Pending"
  amount: {
    total: number
    pending: number
  }
  status: string
}

interface PackageTableProps {
  filter: boolean;
}

export function PackageTable({ packageAdded, setPackageAdded, download, setDownload }) {
  const { currentUser } = useAuth();

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // const [selectedPackages, setSelectedPackages] = useState<string[]>([])
  const loadPackages = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const result = await fetchPackagesWithPagination(db, page);

      setPackages(result.packages);
      setFilteredPackages(result.packages)
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
    loadPackages();
  }, []);
  useEffect(() => {

    if (packageAdded === true) {
      loadPackages()

      setPackageAdded(false)
    }
  }, [packageAdded])

  //filters login
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<FilterValues | null>(null)

  useEffect(() => {
    let result = [...packages]

    // Apply search
    if (searchQuery) {
      result = result.filter(
        (pkg) =>
          pkg.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.receiver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply filters
    if (activeFilters) {
      // Filter by status
      if (activeFilters.status) {
        result = result.filter(
          (pkg) => pkg.status.toLowerCase() === activeFilters.status.toLowerCase()
        )
      }

      // Filter by payment status
      if (activeFilters.paymentStatus.paid || activeFilters.paymentStatus.pending) {

        result = result.filter((pkg) => {
          // If both checkboxes are checked, show all
          if (activeFilters.paymentStatus.paid && activeFilters.paymentStatus.pending) {
            return true
          }
          // If only paid is checked
          if (activeFilters.paymentStatus.paid) {
            return pkg.paymentStatus === "Paid"
          }
          // If only pending is checked
          if (activeFilters.paymentStatus.pending) {
            return pkg.paymentStatus === "Partially Paid"
          }
          // If neither is checked, show none
          return false
        })
      }
    }



    setFilteredPackages(result)
  }, [searchQuery, activeFilters, packages])

  const handleApplyFilter = (filters: FilterValues) => {

    setActiveFilters(filters)
  }

  const handleResetFilter = () => {
    setActiveFilters(null)
  }
  const handleSaveFilter = () => {
    // Implement save filter functionality
    // toast({
    //   title: "Success",
    //   description: "Filter settings have been saved",
    // })
  }
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      const success = await deletePackage(db, id);
      if (success) {
        loadPackages(currentPage);
        setSelectedPackages(prev => prev.filter(pkgId => pkgId !== id));
      }
    }
  };

  const handleBulkAction = async (action: string) => {
    if (action === 'delete' && selectedPackages.length > 0) {
      if (window.confirm(`Are you sure you want to delete ${selectedPackages.length} packages?`)) {
        const success = await bulkDeletePackages(db, selectedPackages);
        if (success) {
          loadPackages(currentPage);
          setSelectedPackages([]);
        }
      }
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadPackages(page);
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
      setSelectedPackages(packages.map((pkg) => pkg.id))
    } else {
      setSelectedPackages([])
    }
  }

  const handleSelect = (id: string) => {
    if (selectedPackages.includes(id)) {
      setSelectedPackages(selectedPackages.filter((pkgId) => pkgId !== id))
    } else {
      setSelectedPackages([...selectedPackages, id])
    }
  }
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const handleViewDetails = (packageId: string) => {

    setSelectedPackageId(packageId);
  };

  useEffect(() => {
    if (download) {
      exportToCSV()
      setDownload(false)
    }
  }, [download])
  const exportToCSV = () => {
    const csvData = packages.map((pkg) => ({
      ID: pkg.id,
      SenderName: pkg.sender.name,
      SenderAddress: pkg.sender.address,
      SenderPhone: pkg.sender.phone,
      ReceiverName: pkg.receiver.name,
      ReceiverAddress: pkg.receiver.address,
      ReceiverPhone: pkg.receiver.phone,
      InvoiceNo: pkg.invoiceNo,
      DateOfAcceptance: pkg.dateOfAcceptance,
      PackageWeight: pkg.packageWeight,
      ContentDetail: pkg.contentDetail,
      PaymentStatus: pkg.paymentStatus,
      TotalAmount: pkg.amount.total,
      PendingAmount: pkg.amount.pending,
      Status: pkg.status,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "packages.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleBackToTable = () => {
    setSelectedPackageId(null);
  };
  if (loading) {
    return <Loader />
  }
  if (selectedPackageId) {
    return (
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToTable}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Packages
        </Button>
        <PackageDetails packageId={selectedPackageId} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {currentUser?.userType === 'admin' ? (
          <div className="flex items-center gap-2">
            <Select onValueChange={handleBulkAction}>
              <SelectTrigger className="w-[230px]">
                <SelectValue placeholder="Bulk Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="delete"
                  className="text-red-500"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="text-red-500">Delete Selected</span>
                  </div>
                </SelectItem>

              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')}>
              Apply
            </Button>
          </div>
        ) : <div></div>}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <FilterPopover
            filters={activeFilters || {
              paymentStatus: {
                paid: false,
                pending: false
              },
              status: ""
            }}
            onApplyFilter={handleApplyFilter}
            onResetFilter={handleResetFilter}
          />
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedPackages.length === packages.length}
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                />
              </TableHead>
              <TableHead>Sender Detail</TableHead>
              <TableHead>Receiver Detail</TableHead>
              <TableHead>Invoice No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPackages.map((pkg) => (
              <TableRow key={pkg.id}>

                <TableCell>
                  <Checkbox
                    checked={selectedPackages.includes(pkg.id)}
                    onCheckedChange={() => handleSelect(pkg.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{pkg.sender.name}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                      <span className="truncate max-w-[150px]">{pkg.sender.address}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="mr-1 h-3 w-3 flex-shrink-0" />
                      <span>{pkg.sender.phone}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{pkg.receiver.name}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                      <span className="truncate max-w-[150px]">{pkg.receiver.address}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="mr-1 h-3 w-3 flex-shrink-0" />
                      <span>{pkg.receiver.phone}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-blue-600">{pkg.invoiceNo}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <p>{pkg.dateOfAcceptance}</p>
                    <p className="text-sm text-muted-foreground">
                      Weight: {pkg.packageWeight}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {pkg.status}
                  </p>
                </TableCell>
                <TableCell>{pkg.paymentStatus}</TableCell>
                <TableCell>
                  <div>
                    <p>Total: ${pkg.amount.total}</p>
                    <p className="text-sm text-muted-foreground">Pending: ${pkg.amount.pending}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleViewDetails(pkg.id)} variant="ghost" size="icon" className="h-8 w-8">
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

      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {filteredPackages.map((pkg) => (
          <Card key={pkg.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold text-lg text-blue-600">{pkg.invoiceNo}</p>
                  <p className="text-sm text-muted-foreground">{pkg.dateOfAcceptance}</p>
                </div>
                <Badge variant={pkg.paymentStatus === "Paid" ? "default" : "secondary"}>
                  {pkg.paymentStatus}
                </Badge>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="font-medium">Sender: {pkg.sender.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{pkg.sender.address}</p>
                </div>
                <div>
                  <p className="font-medium">Receiver: {pkg.receiver.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{pkg.receiver.address}</p>
                </div>
                <div>
                  <p className="font-medium">Weight: {pkg.packageWeight}</p>
                  <p className="text-sm text-muted-foreground truncate">{pkg.contentDetail}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-medium">Total: ${pkg.amount.total}</p>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  )
}

