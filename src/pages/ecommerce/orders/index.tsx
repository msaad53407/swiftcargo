import { OrdersTable } from "@/components/orders/OrdersTable";
import { OrdersTableSKeleton } from "@/components/orders/OrdersTableSkeleton";
import PrintOrders from "@/components/orders/PrintOrders";
import ProductsSearchModal from "@/components/products/ProductsSearchModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types/order";
import { Settings2, Upload } from "lucide-react";
import Papa from "papaparse";
import { useState } from "react";

export default function OrdersPage() {
  const {
    setFilters,
    filters,
    resetFilters,
    filterMetadata,
    filteredData,
    isLoading,
    searchQuery,
    setSearchQuery,
    orders,
  } = useOrders();

  const [showFilters, setShowFilters] = useState(false);

  const { currentUser } = useAuth();

  const exportToCSV = () => {
    const csvData = orders.map((order) => ({
      OrderID: order.numericalId,
      Product: order.product.name,
      SKU: order.product.sku,
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

  return (
    <div className="container py-10 px-4 space-y-4">
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
          {currentUser?.userType === "admin" && <ProductsSearchModal />}
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
        <div className="flex gap-2">
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
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          {filteredData && <PrintOrders orders={filteredData} />}
        </div>
      </div>
      {isLoading ? <OrdersTableSKeleton /> : <OrdersTable data={filteredData} />}
    </div>
  );
}
