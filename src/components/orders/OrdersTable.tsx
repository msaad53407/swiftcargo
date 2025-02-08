import { Button } from "@/components/ui/button";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, generatePaginationNUmbers } from "@/lib/utils";
import { Check, Eye, Pencil, Trash2 } from "lucide-react";

import { useOrders } from "@/hooks/useOrders";
import { Order, OrderStatus } from "@/types/order";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import DeleteAlertModal from "../products/DeleteAlertModal";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type Props = {
  data?: Order[];
  showFooter?: boolean;
  limit?: number;
};

export function OrdersTable({ data: filteredData, showFooter = true, limit }: Props) {
  const { totalPages, currentPage, setCurrentPage, changeOrderStatus, deleteOrder, isChangingStatus, isDeleting } =
    useOrders(limit);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      changeOrderStatus(
        { orderId, status },
        {
          onSuccess: (success) => {
            if (success) toast.success("Order status updated successfully!");
            else toast.error("Failed to update order status");
          },
        },
      );
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      deleteOrder(id, {
        onSuccess: (success) => {
          if (success) toast.success("Order deleted successfully!");
          else toast.error("Failed to delete order");
        },
        onError: () => {
          toast.error("Failed to delete order");
        },
      });
    } catch (error) {
      toast.error("Failed to delete order");
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Id.</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium text-blue-600">{order.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {order.product.image && (
                      <img src={order.product.image} alt={order.product.name} className="w-8 h-8 rounded-full" />
                    )}
                    {order.product.name}
                  </div>
                </TableCell>
                <TableCell>{order.product.sku}</TableCell>
                <TableCell>{order.product.supplier}</TableCell>
                <TableCell>
                  {order.orderVariations.reduce((total, variation) => total + variation.quantity, 0)} in stock
                </TableCell>
                <TableCell>
                  <span
                    className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize", {
                      "bg-green-50 text-green-700": order.status === OrderStatus.COMPLETED,
                      "bg-red-50 text-red-700": order.status === OrderStatus.CANCELLED,
                      "bg-yellow-50 text-yellow-700": order.status === OrderStatus.PENDING,
                    })}
                  >
                    {order.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Popover>
                      <PopoverTrigger className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Change status</span>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        {Object.values(OrderStatus).map((status) => (
                          <div className="flex justify-between items-center">
                            <Button
                              key={status}
                              className="flex items-center w-full justify-start"
                              disabled={status === order.status}
                              variant="ghost"
                              onClick={() => handleStatusChange(order.id, status)}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn("h-2 w-2 rounded-full", {
                                    "bg-green-600": status === OrderStatus.COMPLETED,
                                    "bg-red-600": status === OrderStatus.CANCELLED,
                                    "bg-yellow-600": status === OrderStatus.PENDING,
                                  })}
                                />
                                <span className="capitalize">
                                  {isChangingStatus && status === order.status ? "Updating..." : status}
                                </span>
                              </div>
                            </Button>
                            {status === order.status && (
                              <div className="h-8 w-8">
                                <Check className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        ))}
                      </PopoverContent>
                    </Popover>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" asChild>
                      <Link to={`/ecommerce/orders/update/${order.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteAlertModal
                      onDelete={() => handleDeleteOrder(order.id)}
                      isDeleting={isDeleting}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {showFooter ? (
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
        ) : null}
      </div>
    </div>
  );
}
