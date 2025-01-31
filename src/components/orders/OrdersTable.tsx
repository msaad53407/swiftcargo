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
import { OrderStatus, type OrderFilters } from "@/types/order";
import { Eye, Pencil, Settings2, Trash2, Upload } from "lucide-react";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import DeleteOrderModal from "./DeleteOrderModal";

import type { Order } from "@/types/order";
import ProductsSearchModal from "../products/ProductsSearchModal";
import { Label } from "../ui/label";
import { OrdersTableSKeleton } from "./OrdersTableSkeleton";

export const mockOrders: Order[] = [
  {
    id: "#567834",
    product: {
      name: "Product 1",
      image: "/placeholder.svg?height=96&width=96",
      id: "1",
      sku: "#4555",
      supplier: "James Martin",
      variations: [],
    },
    sku: "#4555",
    supplier: "James Martin",
    quantity: "500 in Stock",
    status: OrderStatus.COMPLETED,
  },
];

export const suppliers = ["James Martin", "Noami Lawrence", "Balanca Lawrence"];
export const skus = ["#4555", "#4556", "#4557"];

export function OrdersTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<OrderFilters>({
    status: [],
    sku: "",
    supplier: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filters.status.length === 0 || filters.status.includes(order.status);
    const matchesSku = !filters.sku || order.sku === filters.sku;
    const matchesSupplier = !filters.supplier || order.supplier === filters.supplier;

    return matchesSearch && matchesStatus && matchesSku && matchesSupplier;
  });

  const exportToCSV = () => {
    const csvData = mockOrders.map((order) => ({
      OrderID: order.id,
      Product: order.product.name,
      SKU: order.sku,
      Supplier: order.supplier,
      Quantity: order.quantity,
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

  const resetFilters = () => {
    setFilters({
      status: [],
      sku: "",
      supplier: "",
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
                    {["completed", "cancelled", "pending"].map((status) => (
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
                      {skus.map((sku) => (
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
                      {suppliers.map((supplier) => (
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
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-blue-600">{order.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={order.product.image || "/placeholder.svg"}
                        alt={order.product.name}
                        className="w-8 h-8 rounded-full"
                      />
                      {order.product.name}
                    </div>
                  </TableCell>
                  <TableCell>{order.sku}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>
                    <span
                      className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium", {
                        "bg-green-50 text-green-700": order.status === "completed",
                        "bg-red-50 text-red-700": order.status === "cancelled",
                        "bg-yellow-50 text-yellow-700": order.status === "pending",
                      })}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600">
                        <Pencil className="h-4 w-4" />
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
            //   onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            //   disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {/* {generatePaginationNUmbers(3, currentPage, totalPages).map((pageNum, idx) => {
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
              })} */}
            </div>

            <Button
              variant="outline"
            //   onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            //   disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
