import { Order, OrderFilters } from "@/types/order";
import { getOrders } from "@/utils/order";
import { useEffect, useMemo, useState } from "react";

export function useOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [filterMetadata, setFilterMetadata] = useState<{
    suppliers: string[];
    skus: string[];
  }>({
    suppliers: [],
    skus: [],
  });

  const limit = 10;
  const totalPages = Math.ceil(totalOrders / limit);

  useEffect(() => {
    setLoading(true);
    const fetchProducts = async () => {
      const { orders, total } = await getOrders(limit, currentPage);
      setOrders(orders);
      setTotalOrders(total);
    };
    fetchProducts().then(() => setLoading(false));
  }, [currentPage]);

  useEffect(() => {
    if (orders.length > 0) {
      const suppliers = orders.map((order) => order.product.supplier);
      const skus = orders.map((order) => order.product.sku);
      setFilterMetadata({ suppliers, skus });
    }
  }, [orders]);

  const [filters, setFilters] = useState<OrderFilters>({
    status: [],
    sku: "",
    supplier: "",
  });

  const filteredData = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.product.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.product.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filters.status.length === 0 || filters.status.includes(order.status);
      const matchesSku = !filters.sku || order.product.sku === filters.sku;
      const matchesSupplier = !filters.supplier || order.product.supplier === filters.supplier;

      return matchesSearch && matchesStatus && matchesSku && matchesSupplier;
    });
  }, [orders, searchQuery, filters]);

  const resetFilters = () => {
    setFilters({
      status: [],
      sku: "",
      supplier: "",
    });
  };

  return {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    actionLoading,
    setActionLoading,
    orders,
    loading,
    totalOrders,
    totalPages,
    filteredData,
    setFilters,
    filters,
    resetFilters,
    filterMetadata,
  };
}
