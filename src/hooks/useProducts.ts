import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct, getProducts, toggleProductVisibility } from "@/utils/product";
import { useState, useMemo } from "react";
import type { Product } from "@/types/product";

export function useProducts(searchTerm?: string) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", currentPage, searchTerm],
    queryFn: () => getProducts(limit, currentPage, searchTerm),
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: toggleProductVisibility,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products", currentPage, searchTerm || null],
        exact: true,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      console.log(currentPage, searchTerm);
      queryClient.invalidateQueries({
        queryKey: ["products", currentPage, searchTerm || null],
        exact: true,
      });
    },
  });

  const filteredData = useMemo(() => {
    return (
      data?.products.filter(
        (product: Product) =>
          product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ) || []
    );
  }, [data?.products, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    products: data?.products || [],
    isLoading,
    error,
    totalProducts: data?.total || 0,
    totalPages: Math.ceil((data?.total || 0) / limit),
    filteredData,
    toggleProductVisibility: toggleVisibilityMutation.mutate,
    isToggling: toggleVisibilityMutation.isPending,
    deleteProduct: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
