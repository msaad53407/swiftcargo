import { Download, Eye, EyeOff, Pencil, Settings2, Trash2 } from "lucide-react";
import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Product } from "@/types/product";
import { Link } from "react-router-dom";

import { deleteProduct, toggleProductVisibility } from "@/utils/product";
import { toast } from "sonner";

export type ProductsTableProps = {
  data: Product[];
};

export function ProductsTable({ data }: ProductsTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [actionLoading, setActionLoading] = React.useState(false);
  const itemsPerPage = 8;

  const filteredData = React.useMemo(() => {
    return data.filter(
      (product) =>
        product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [data, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleVisibility = async (id: string) => {
    setActionLoading(true);
    const result = await toggleProductVisibility(id);
    if (result.success) {
      setActionLoading(false);
      toast.success("Product visibility updated successfully!");
      return;
    }

    setActionLoading(false);
    toast.error("Failed to update product visibility!");
  };

  const deleteProductHandler = async (id: string) => {
    setActionLoading(true);
    const result = await deleteProduct(id);
    if (result) {
      setActionLoading(false);
      toast.success("Product deleted successfully!");
      return;
    }

    setActionLoading(false);
    toast.error("Failed to delete product!");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Product Management</h1>
          <p className="text-sm text-muted-foreground">Departmental Member's Information Details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
            <span className="sr-only">Export</span>
          </Button>
          <Button asChild>
            <Link to="/ecommerce/products/add">
              <span>Add Product</span>
            </Link>
          </Button>
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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Id.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium text-blue-600">#{product.id}</TableCell>
                <TableCell>{new Date(product.createdAt).toDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {product?.image && <img src={product.image} alt={product.name} className="w-8 h-8 rounded-full" />}
                    {product.name}
                  </div>
                </TableCell>
                <TableCell>#{product.sku}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={actionLoading}
                      onClick={() => toggleVisibility(product.id)}
                    >
                      {product.visibility ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the selected product and all its
                            variations.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteProductHandler(product.id)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
          <div className="flex items-center gap-2">
            <Select value={currentPage.toString()} onValueChange={(value) => setCurrentPage(Number(value))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalPages }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Page {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">of {totalPages} pages</span>
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
