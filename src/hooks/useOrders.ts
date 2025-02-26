import type { Order, OrderFilters, OrderStatus } from "@/types/order";
import {
  addOrder,
  addOrderSchema,
  changeBulkOrderStatus,
  changeOrderStatus,
  deleteBulkOrders,
  deleteOrder,
  getOrders,
  getTotalOrdersCount,
} from "@/utils/order";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";

export function useOrders(limit: number = 10, completedOrders = false) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<OrderFilters>({
    status: [],
    sku: "",
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
    queryKey: ["orders", currentPage, completedOrders],
    queryFn: () => getOrders(limit, currentPage, completedOrders),
  });

  const filteredData = useMemo(
    () =>
      data?.orders.filter((order: Order) => {
        const matchesSearch =
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.numericalId.toString().includes(searchQuery.toLowerCase()) ||
          order.product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.product.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filters.status.length === 0 || filters.status.includes(order.status);
        const matchesSku = !filters.sku || order.product.sku === filters.sku;
        return matchesSearch && matchesStatus && matchesSku;
      }),
    [data?.orders, searchQuery, filters],
  );

  const changeStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) => changeOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders", currentPage, true],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders", currentPage, false],
        exact: true,
      });
    },
  });

  const changeBulkOrderStatusMutation = useMutation({
    mutationFn: ({ orderIds, status }: { orderIds: string[]; status: OrderStatus }) =>
      changeBulkOrderStatus(orderIds, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders", currentPage, true],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders", currentPage, false],
        exact: true,
      });
    },
  });

  const addOrderMutation = useMutation({
    mutationFn: (data: z.infer<typeof addOrderSchema>) => addOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders", currentPage, completedOrders],
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
        queryKey: ["orders", currentPage, true],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders", currentPage, false],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["ordersCount"],
        exact: true,
      });
    },
  });

  const deleteBulkOrdersMutation = useMutation({
    mutationFn: (ids: string[]) => deleteBulkOrders(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders", currentPage, true],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders", currentPage, false],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["ordersCount"],
        exact: true,
      });
    },
  });

  const filterMetadata = useMemo(() => {
    if (!data?.orders) return { skus: [] };
    const skus = [...new Set(data.orders.map((order: Order) => order.product.sku))];
    return { skus };
  }, [data?.orders]);

  const resetFilters = () => {
    setFilters({
      status: [],
      sku: "",
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
    changeBulkOrderStatus: changeBulkOrderStatusMutation.mutate,
    deleteOrder: deleteOrderMutation.mutate,
    deleteBulkOrders: deleteBulkOrdersMutation.mutate,
    addOrder: addOrderMutation.mutate,
    isChangingStatus: changeStatusMutation.isPending,
    isChangingBulkOrderStatus: changeBulkOrderStatusMutation.isPending,
    isDeleting: deleteOrderMutation.isPending,
    isDeletingBulkOrders: deleteBulkOrdersMutation.isPending,
    isAdding: addOrderMutation.isPending,
  };
}
