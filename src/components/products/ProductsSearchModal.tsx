import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useProducts } from "@/hooks/useProducts";
import { generatePaginationNUmbers } from "@/lib/utils";
import type { Product } from "@/types/product";
import { Loader2, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";

const ProductsSearchModal = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search term with 300ms delay
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const { loading, totalPages, products } = useProducts(debouncedSearchTerm);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, totalPages]); // Added totalPages to dependencies

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-6 w-6" />
          <span className="sr-only">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select a product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Search Products</Label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, SKU, or supplier..."
            />
          </div>

          <div className="relative min-h-[300px]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : products.length > 0 ? (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {products.map((product) => (
                    <ProductListItem
                      key={product.id}
                      product={product}
                      link={`/ecommerce/orders/add?product=${product.id}`}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                No products found
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {generatePaginationNUmbers(2, currentPage, totalPages).map((pageNum, idx) => {
                  if (pageNum === "...") {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2">
                        ...
                      </span>
                    );
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(Number(pageNum))}
                      disabled={loading}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductsSearchModal;

interface ProductListItemProps {
  product: Product;
  link: string;
}

function ProductListItem({ product, link }: ProductListItemProps) {
  return (
    <Link to={link} className={"flex items-center gap-3 p-2 cursor-pointer rounded-lg hover:bg-accent"}>
      {product.image && (
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="h-10 w-10 rounded-lg object-cover"
        />
      )}
      <div className="flex-1 overflow-hidden">
        <p className="font-medium truncate">{product.name}</p>
        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
      </div>
    </Link>
  );
}
