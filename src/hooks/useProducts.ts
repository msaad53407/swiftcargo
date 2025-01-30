import type { Product } from "@/types/product";
import { useEffect, useMemo, useState } from "react";
import { getProducts } from "@/utils/product";

export function useProducts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  const limit = 10;
  const totalPages = Math.ceil(totalProducts / limit);

  useEffect(() => {
    setLoading(true);
    const fetchProducts = async () => {
      const { products, total } = await getProducts(limit, currentPage);
      setProducts(products);
      setTotalProducts(total);
    };
    fetchProducts().then(() => setLoading(false));
  }, [currentPage]);

  const filteredData = useMemo(() => {
    return products.filter(
      (product) =>
        product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [products, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    actionLoading,
    setActionLoading,
    products,
    loading,
    totalProducts,
    totalPages,
    filteredData,
  };
}
