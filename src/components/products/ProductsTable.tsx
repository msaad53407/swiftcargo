import { Eye, EyeOff, Pencil, PlusIcon, Printer, Settings2, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { cn, generatePaginationNUmbers } from "@/lib/utils";
import Papa from "papaparse";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { handleBulkPrint } from "./BulkPrintProduct";
import DeleteAlertModal from "./DeleteAlertModal";
import { TableSkeleton as ProductsTableSkeleton } from "./ProductsTableSkeleton";

export function ProductsTable() {
  const {
    products,
    isLoading,
    currentPage,
    filteredData,
    totalPages,
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    toggleProductVisibility,
    isToggling,
    deleteProduct,
    isDeleting,
    filterMetadata,
    filters,
    setFilters,
    resetFilters,
  } = useProducts();

  const { currentUser } = useAuth();

  const [showFilters, setShowFilters] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const navigate = useNavigate();

  const handleSelectAll = (checked: string | boolean) => {
    if (checked) {
      setSelectedProducts(filteredData.map((product) => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (checked: string | boolean, productId: string) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    }
  };

  const handleBulkAction = async (action: "delete" | "print") => {
    if (action !== "print" && action !== "delete") return;

    if (currentUser && currentUser.userType === "manager" && action === "delete") {
      toast.error("Unauthorized. Only Admins can delete products.");
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    switch (action) {
      case "delete":
        if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
          try {
            await Promise.all(selectedProducts.map((id) => deleteProduct(id)));
            toast.success(`${selectedProducts.length} products deleted successfully`);
            setSelectedProducts([]);
          } catch (error) {
            toast.error("Failed to delete products");
          }
        }
        break;
      case "print":
        const selectedProductsData = filteredData.filter((product) => selectedProducts.includes(product.id));
        handleBulkPrint(selectedProductsData);
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Product Management</h1>
            <p className="text-sm text-muted-foreground">Departmental Member's Information Details</p>
          </div>
          <div className="flex gap-2">
            {currentUser?.userType === "admin" && (
              <Button asChild>
                <Link to="/ecommerce/products/add">
                  <PlusIcon className="h-6 w-6" />
                  <span className="sr-only">Add</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Input
              placeholder="Type to Search for orders"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ProductsTableSkeleton />
      </div>
    );
  }

  if (products.length === 0)
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Product Management</h1>
            <p className="text-sm text-muted-foreground">Departmental Member's Information Details</p>
          </div>
          <div className="flex gap-2">
            {currentUser?.userType === "admin" && (
              <Button asChild>
                <Link to="/ecommerce/products/add">
                  <PlusIcon className="h-6 w-6" />
                  <span className="sr-only">Add</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Input
              placeholder="Type to Search for orders"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <p>No products found.</p>
        </div>
      </div>
    );

  const exportToCSV = () => {
    const csvData = products.map((product) => ({
      ID: product.numericalId,
      Name: product.name,
      SKU: product.sku,
      Description: product.description,
      Image: product.image || " ",
      Visibility: product.visibility ? "Visible" : "Hidden",
      CreatedAt: product.createdAt,
      UpdatedAt: product.updatedAt,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "products.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleVisibility = (id: string) => {
    try {
      toggleProductVisibility(id, {
        onSuccess: () => {
          toast.success("Product visibility updated successfully!");
        },
        onError: () => {
          toast.error("Failed to update product visibility!");
        },
      });
    } catch (error) {
      toast.error("Failed to update product visibility!");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Product Management</h1>
          <p className="text-sm text-muted-foreground">Departmental Member's Information Details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="flex gap-2 w-fit px-2" onClick={exportToCSV}>
            <Upload className="h-6 w-6" />
            <span>Export</span>
          </Button>
          {currentUser && currentUser.userType === "admin" && (
            <Button asChild>
              <Link
                to="/ecommerce/products/add"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentUser && currentUser.userType === "manager") {
                    toast.error("Unauthorized. Only Admins can add products.");
                    return;
                  }
                  navigate({ pathname: "/ecommerce/products/add" });
                }}
              >
                <PlusIcon className="h-6 w-6" />
                <span className="sr-only">Add</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex w-full items-center justify-between">
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
                {/* <div>
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
                  </div> */}
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
      </div>

      <div className="flex items-center gap-2">
        <Select onValueChange={handleBulkAction}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Bulk Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none" className="text-gray-500">
              <div className="flex items-center gap-2">None</div>
            </SelectItem>
            {/* <SelectItem value="delete" className="text-red-500">
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </div>
            </SelectItem> */}
            <SelectItem value="print">
              <div className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print Selected
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={filteredData?.length > 0 && selectedProducts.length === filteredData.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              {currentUser && currentUser.userType === "admin" && <TableHead className="text-right">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={(checked) => handleSelectProduct(checked, product.id)}
                    />
                  </TableCell>
                  <TableCell>{new Date(product.createdAt).toDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product?.image && (
                        <img src={product.image} alt={product.name} className="w-8 h-8 rounded-full" />
                      )}
                      {product.name}
                    </div>
                  </TableCell>
                  <TableCell>#{product.sku}</TableCell>
                  {currentUser && currentUser.userType === "admin" && (
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isToggling}
                          onClick={() => {
                            if (currentUser && currentUser.userType === "manager") {
                              toast.error("Unauthorized. Only Admins can toggle product visibility.");
                              return;
                            }
                            handleToggleVisibility(product.id);
                          }}
                        >
                          {product.visibility ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" asChild>
                          <Link
                            to={`/ecommerce/products/update/${product.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentUser && currentUser.userType === "manager") {
                                toast.error("Unauthorized. Only Admins can update products.");
                                return;
                              }
                              navigate({ pathname: `/ecommerce/products/update/${product.id}` });
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteAlertModal
                          isDeleting={isDeleting}
                          onDelete={async () => {
                            deleteProduct(product.id, {
                              onSuccess: () => {
                                toast.success("Product deleted successfully!");
                              },
                              onError: () => {
                                toast.error("Failed to delete product!");
                              },
                            });
                          }}
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
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
    </div>
  );
}
