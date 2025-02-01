import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, generatePaginationNUmbers } from "@/lib/utils";
import { Check, Eye, Pencil, Settings2, Trash2, Upload } from "lucide-react";
import Papa from "papaparse";
import { useState } from "react";
import DeleteOrderModal from "./DeleteOrderModal";

import { useOrders } from "@/hooks/useOrders";
import { OrderStatus } from "@/types/order";
import { changeOrderStatus } from "@/utils/order";
import { toast } from "sonner";
import ProductsSearchModal from "../products/ProductsSearchModal";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { OrdersTableSKeleton } from "./OrdersTableSkeleton";
import { Link } from "react-router-dom";

export function OrdersTable() {
  const [showFilters, setShowFilters] = useState(false);

  const {
    loading,
    orders,
    totalPages,
    currentPage,
    setCurrentPage,
    filteredData,
    setFilters,
    filters,
    resetFilters,
    filterMetadata,
    searchQuery,
    setSearchQuery,
  } = useOrders();

  const exportToCSV = () => {
    const csvData = orders.map((order) => ({
      OrderID: order.id,
      Product: order.product.name,
      SKU: order.product.sku,
      Supplier: order.product.supplier,
      Quantity: order.orderVariations.reduce((total, variation) => total + variation.quantity, 0),
      Status: order.status,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "orders.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    toast.promise(changeOrderStatus(orderId, status), {
      loading: "Updating order status...",
      success: "Order status updated successfully!",
      error: "Failed to update order status",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Order Management</h1>
          <p className="text-sm text-muted-foreground">Departmental Member's Information Details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="flex gap-2 w-fit px-2" onClick={exportToCSV}>
            <Upload className="h-6 w-6" />
            <span>Export</span>
          </Button>
          <ProductsSearchModal />
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Input
            placeholder="Type to Search for orders"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu open={showFilters} onOpenChange={setShowFilters}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(Object.values(filters).some((v) => v.length) && "bg-primary text-primary-foreground")}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[280px]" align="end">
            <div className="flex items-center justify-between p-2">
              <p className="text-sm font-medium">Filter Orders</p>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={resetFilters}>
                Reset Filter
              </Button>
            </div>
            <DropdownMenuSeparator />
            <div className="p-2">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-1 block">Status</Label>
                  <div className="space-y-2">
                    {Object.values(OrderStatus).map((status) => (
                      <div key={status} className="flex items-center">
                        <Label className="flex items-center gap-2 text-sm capitalize">
                          <Input
                            type="checkbox"
                            checked={filters.status.includes(status)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters((f) => ({
                                  ...f,
                                  status: [...f.status, status],
                                }));
                              } else {
                                setFilters((f) => ({
                                  ...f,
                                  status: f.status.filter((s) => s !== status),
                                }));
                              }
                            }}
                            className="form-checkbox h-4 w-4 rounded border-gray-300"
                          />
                          {status}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">SKU</Label>
                  <Select value={filters.sku} onValueChange={(value) => setFilters((f) => ({ ...f, sku: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select SKU" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterMetadata.skus.map((sku) => (
                        <SelectItem key={sku} value={sku}>
                          {sku}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Supplier</Label>
                  <Select
                    value={filters.supplier}
                    onValueChange={(value) => setFilters((f) => ({ ...f, supplier: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterMetadata.suppliers.map((supplier) => (
                        <SelectItem key={supplier} value={supplier}>
                          {supplier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <OrdersTableSKeleton />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Id.</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-blue-600">{order.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {order.product.image && (
                        <img src={order.product.image} alt={order.product.name} className="w-8 h-8 rounded-full" />
                      )}
                      {order.product.name}
                    </div>
                  </TableCell>
                  <TableCell>{order.product.sku}</TableCell>
                  <TableCell>{order.product.supplier}</TableCell>
                  <TableCell>
                    {order.orderVariations.reduce((total, variation) => total + variation.quantity, 0)} in stock
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize", {
                        "bg-green-50 text-green-700": order.status === OrderStatus.COMPLETED,
                        "bg-red-50 text-red-700": order.status === OrderStatus.CANCELLED,
                        "bg-yellow-50 text-yellow-700": order.status === OrderStatus.PENDING,
                      })}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Popover>
                        <PopoverTrigger className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Change status</span>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          {Object.values(OrderStatus).map((status) => (
                            <div className="flex justify-between items-center">
                              <Button
                                key={status}
                                className="flex items-center w-full justify-start"
                                disabled={status === order.status}
                                variant="ghost"
                                onClick={() => handleStatusChange(order.id, status)}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn("h-2 w-2 rounded-full", {
                                      "bg-green-600": status === OrderStatus.COMPLETED,
                                      "bg-red-600": status === OrderStatus.CANCELLED,
                                      "bg-yellow-600": status === OrderStatus.PENDING,
                                    })}
                                  />
                                  <span className="capitalize">{status}</span>
                                </div>
                              </Button>
                              {status === order.status && (
                                <div className="h-8 w-8">
                                  <Check className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          ))}
                        </PopoverContent>
                      </Popover>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" asChild>
                        <Link to={`/ecommerce/orders/update/${order.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteOrderModal
                        id={order.id}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {generatePaginationNUmbers(3, currentPage, totalPages).map((pageNum, idx) => {
                if (pageNum === "...") {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-3 py-2">
                      ...
                    </span>
                  );
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(Number(pageNum))}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
