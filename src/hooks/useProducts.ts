import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct, getProducts, getTotalProductsCount, toggleProductVisibility } from "@/utils/product";
import { useState, useMemo } from "react";
import type { Product } from "@/types/product";

export function useProducts(searchTerm?: string) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<{
    status: string[];
    sku: string;
  }>({
    status: [],
    sku: "",
  });

  const limit = 10;

  const {
    data: productsCount,
    isLoading: isLoadingProductsCount,
    error: productsCountError,
  } = useQuery({
    queryKey: ["productsCount"],
    queryFn: getTotalProductsCount,
  });

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
      queryClient.invalidateQueries({
        queryKey: ["products", currentPage, searchTerm || null],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["products", currentPage, searchTerm || ""],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["productsCount"],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders", 1],
        exact: true,
      });
    },
  });

  const filteredData = useMemo(
    () =>
      data?.products.filter((product: Product) => {
        const matchesSearch =
          product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.numericalId.toString().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSku = !filters.sku || product.sku === filters.sku;
        return matchesSearch && matchesSku;
      }) || [],
    [data?.products, searchQuery, filters],
  );

  const filterMetadata = useMemo(() => {
    if (!data?.products) return { skus: [] };
    const skus = [...new Set(data.products.map((product: Product) => product.sku))];
    return { skus };
  }, [data?.products]);

  const resetFilters = () => {
    setFilters({
      status: [],
      sku: "",
    });
  };

  return {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    productsCount,
    isLoadingProductsCount,
    productsCountError,
    products: data?.products || [],
    filters,
    setFilters,
    resetFilters,
    filterMetadata,
    isLoading,
    error,
    totalProducts: data?.total || 0,
    totalPages: Math.ceil((data?.total || 0) / limit),
    filteredData,
    toggleProductVisibility: toggleVisibilityMutation.mutateAsync,
    isToggling: toggleVisibilityMutation.isPending,
    deleteProduct: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
