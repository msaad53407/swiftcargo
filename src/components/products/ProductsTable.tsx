import { Eye, EyeOff, Pencil, PlusIcon, Settings2, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProducts } from "@/hooks/useProducts";
import { generatePaginationNUmbers } from "@/lib/utils";
import Papa from "papaparse";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DeleteAlertModal from "./DeleteAlertModal";
import { TableSkeleton as ProductsTableSkeleton } from "./ProductsTableSkeleton";
import { useAuth } from "@/contexts/AuthContext";

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
  } = useProducts();

  const { currentUser } = useAuth();

  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Product Management</h1>
            <p className="text-sm text-muted-foreground">Departmental Member's Information Details</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="flex gap-2 w-fit px-2" disabled>
              <Upload className="h-6 w-6" />
              <span>Export</span>
            </Button>
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
            <Button variant="outline" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
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
            <Button variant="outline" size="icon" className="flex gap-2 w-fit px-2" disabled>
              <Upload className="h-6 w-6" />
              <span>Export</span>
            </Button>
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
            <Button variant="outline" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
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
        <Button variant="outline" size="icon">
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Id.</TableHead>
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
                  <TableCell className="font-medium text-blue-600">#{product.numericalId}</TableCell>
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
