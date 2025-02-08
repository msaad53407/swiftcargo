import type { Order, OrderFilters, OrderStatus } from "@/types/order";
import {
  addOrder,
  addOrderSchema,
  changeOrderStatus,
  deleteOrder,
  getOrders,
  getTotalOrdersCount,
} from "@/utils/order";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";

export function useOrders(limit: number = 10) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<OrderFilters>({
    status: [],
    sku: "",
    supplier: "",
  });

  const queryClient = useQueryClient();

  const {
    data: ordersCount,
    isLoading: isLoadingOrdersCount,
    error: ordersCountError,
  } = useQuery({
    queryKey: ["ordersCount"],
    queryFn: getTotalOrdersCount,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", currentPage],
    queryFn: () => getOrders(limit, currentPage),
  });

  const filteredData = useMemo(
    () =>
      data?.orders.filter((order) => {
        const matchesSearch =
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.product.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.product.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filters.status.length === 0 || filters.status.includes(order.status);
        const matchesSku = !filters.sku || order.product.sku === filters.sku;
        const matchesSupplier = !filters.supplier || order.product.supplier === filters.supplier;
        return matchesSearch && matchesStatus && matchesSku && matchesSupplier;
      }),
    [data?.orders, searchQuery, filters],
  );

  const changeStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) => changeOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders", currentPage],
        exact: true,
      });
    },
  });

  const addOrderMutation = useMutation({
    mutationFn: (data: z.infer<typeof addOrderSchema>) => addOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders", currentPage],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["ordersCount"],
        exact: true,
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => await deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders", currentPage],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["ordersCount"],
        exact: true,
      });
    },
  });

  const filterMetadata = useMemo(() => {
    if (!data?.orders) return { suppliers: [], skus: [] };
    const suppliers = [...new Set(data.orders.map((order: Order) => order.product.supplier))];
    const skus = [...new Set(data.orders.map((order: Order) => order.product.sku))];
    return { suppliers, skus };
  }, [data?.orders]);

  const resetFilters = () => {
    setFilters({
      status: [],
      sku: "",
      supplier: "",
    });
  };

  return {
    orders: data?.orders || [],
    isLoading,
    error,
    totalOrders: data?.total || 0,
    totalPages: Math.ceil((data?.total || 0) / limit),
    currentPage,
    isLoadingOrdersCount,
    ordersCountError,
    ordersCount,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    filteredData,
    setFilters,
    filters,
    resetFilters,
    filterMetadata,
    changeOrderStatus: changeStatusMutation.mutate,
    deleteOrder: deleteOrderMutation.mutate,
    addOrder: addOrderMutation.mutate,
    isChangingStatus: changeStatusMutation.isPending,
    isDeleting: deleteOrderMutation.isPending,
    isAdding: addOrderMutation.isPending,
  };
}
