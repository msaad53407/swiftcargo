"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, Check, ChevronLeft, ChevronRight, Search, Settings2, Trash2 } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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

import { FilterPopover, type FilterValues } from "./filter-popover"
//import { FilterDialog, type FilterValues } from "./filter-dialog"
import { fetchManagers, type Manager } from "@/utils/manager"

import { deleteUserAccount, suspendUserAccount } from "@/utils/deleteEmployee"
import TableSkeleton from "../SkeltonTable"
import Loader from "../Loader"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface Employee {
  id: string
  name: string
  email: string
  department: string
  designation: string
  phone: string
  emailVerified: boolean
  kycVerified: boolean
  status: "Active" | "Pending" | "Suspended"
  avatar?: string
  suspended: boolean
}

export function EmployeeTable({ employeeAdded, setEmployeeAdded }) {
  const { currentUser } = useAuth()

  const [employees, setEmployees] = useState<Manager[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Manager[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [bulkAction, setBulkAction] = useState("")
  const [activeFilters, setActiveFilters] = useState<FilterValues | null>(null)



  const loadManagers = async () => {
    setIsLoading(true);
    try {
      const fetchedManagers = await fetchManagers();
      // Filter out suspended managers
      const activeManagers = fetchedManagers.filter(manager => !manager.suspended);

      setEmployees(activeManagers);
      setFilteredEmployees(activeManagers);
    } catch (error) {
      toast.error("Failed to load managers");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (employeeAdded === true) {
      loadManagers()
      setEmployeeAdded(false)
    }
  }, [employeeAdded])
  // If you need to see all managers including suspended ones, you can create a separate function
  const loadAllManagers = async () => {
    setIsLoading(true);
    try {
      const fetchedManagers = await fetchManagers();
      setEmployees(fetchedManagers);
      setFilteredEmployees(fetchedManagers);
    } catch (error) {
      toast.error("Failed to load managers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadManagers()
  }, [])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Calculate displayed data
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Handle pagination changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };


  // Generate pages with ellipsis
  const generatePageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage > totalPages - 4) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };



  useEffect(() => {
    let result = [...employees]

    // Apply search
    if (searchQuery) {
      result = result.filter(
        (employee) =>
          employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply filters
    if (activeFilters) {
      if (activeFilters.department) {

        result = result.filter(
          (employee) =>
            employee.department.toLowerCase() === activeFilters.department.toLowerCase()
        )
      }
      if (activeFilters.designation) {
        result = result.filter(
          (employee) =>
            employee.designation.toLowerCase() === activeFilters.designation.toLowerCase()
        )
      }
      // if (activeFilters.kycVerified) {
      //   result = result.filter((employee) => employee.kycVerified)

      // }
      // if (activeFilters.emailVerified) {
      //   result = result.filter((employee) => employee.emailVerified)
      // }
      // Note: Implement hasBalance filter based on your data structure
    }

    setFilteredEmployees(result)
  }, [searchQuery, activeFilters, employees])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(filteredEmployees.map((emp) => emp.uid))
    } else {
      setSelectedEmployees([])
    }
  }

  const handleSelect = (id: string) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter((empId) => empId !== id))
    } else {
      setSelectedEmployees([...selectedEmployees, id])
    }
  }

  const handleBulkAction = async () => {
    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee")
      return
    }
    if (bulkAction === "delete") {
      try {
        for (const id of selectedEmployees) {
          const employee = employees.find((emp) => emp.uid === id)
          if (employee) {
            await handleDelete(employee.uid, employee.email, "manager")
          }
        }

        setSelectedEmployees([])
      } catch (error) {
        toast.error("Failed to delete selected employees")
      }
    }
  }

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

  const handleDelete = async (id: string, email: string, userType: string) => {
    const result = await suspendUserAccount(id, email);

    if (result.success) {
      toast.success("User is Deleted Successfully")
      loadManagers()
    } else {
      toast.success(`Failed to delete user: ${result.error}`)

    }
  };


  if (isLoading) {
    return <Loader />
  }

  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-50"
      case "Pending":
        return "text-red-600 bg-red-50"
      case "Suspended":
        return "text-yellow-600 bg-yellow-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {currentUser?.userType === 'admin' ? (
          <div className="flex items-center gap-2">
            <Select value={bulkAction} onValueChange={setBulkAction}>
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkAction}
              className="text-red-500 hover:text-red-600 hover:border-red-600"
            >
              Apply
            </Button>
          </div>
        ) : <div></div>}



        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <FilterPopover
            filters={activeFilters || { department: "", designation: "" }}
            onApplyFilter={handleApplyFilter}
            onResetFilter={handleResetFilter}
            onSaveFilter={handleSaveFilter}
          />
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px] whitespace-nowrap">
                <Checkbox
                  checked={
                    selectedEmployees.length > 0 &&
                    selectedEmployees.length === filteredEmployees.length
                  }
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                />
              </TableHead>
              <TableHead className="whitespace-nowrap">Employee</TableHead>
              <TableHead className="whitespace-nowrap">Department</TableHead>
              <TableHead className="whitespace-nowrap">Phone</TableHead>
              {/* <TableHead className="whitespace-nowrap">Verified</TableHead> */}
              {/* <TableHead>Status</TableHead> */}
              {/* <TableHead className="w-[50px] whitespace-nowrap"></TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.uid}>
                <TableCell className="whitespace-nowrap">
                  <Checkbox
                    checked={selectedEmployees.includes(employee.uid)}
                    onCheckedChange={() => handleSelect(employee.uid)}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-3 ">
                    <Avatar className="h-8 w-8">

                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {employee.name.charAt(0)}
                      </AvatarFallback>

                    </Avatar>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div>
                    <p className="font-medium">{employee.department}</p>
                    <p className="text-sm text-muted-foreground">{employee.designation}</p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">{employee.phone}</TableCell>
                {/* <TableCell className="whitespace-nowrap">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                      <div
                        className={`rounded-full p-1 ${employee.emailVerified ? "bg-green-50" : "bg-gray-50"
                          }`}
                      >
                        <Check
                          size={14}
                          className={employee.emailVerified ? "text-green-600" : "text-gray-400"}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">Email</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className={`rounded-full p-1 ${employee.kycVerified ? "bg-green-50" : "bg-gray-50"
                          }`}
                      >
                        <Check
                          size={14}
                          className={employee.kycVerified ? "text-green-600" : "text-gray-400"}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">KYC</span>
                    </div>
                  </div>
                </TableCell> */}
                {/* <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                      employee.status
                    )}`}
                  >
                    {employee.status}
                  </span>
                </TableCell> */}
                {/* <TableCell className="whitespace-nowrap">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t px-4 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {generatePageNumbers().map((page, i) => (
              <Button
                key={i}
                variant={currentPage === page ? "default" : "ghost"}
                size="icon"
                className={`h-8 w-8 ${typeof page !== "number" ? "cursor-default" : ""}`}
                onClick={() => typeof page === "number" && setCurrentPage(page)}
                disabled={typeof page !== "number"}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

    </div>
  )
}

