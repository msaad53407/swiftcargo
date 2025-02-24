import { Button } from "@/components/ui/button";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generatePaginationNUmbers } from "@/lib/utils";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";

import { useOrders } from "@/hooks/useOrders";
import { Order } from "@/types/order";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import DeleteAlertModal from "../products/DeleteAlertModal";

import { useAuth } from "@/contexts/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";

type Props = {
  data?: Order[];
  showFooter?: boolean;
  limit?: number;
};

export function OrdersTable({ data: filteredData, showFooter = true, limit }: Props) {
  const { totalPages, currentPage, setCurrentPage, deleteOrder, isDeleting } = useOrders(limit);
  const { currentUser } = useAuth();

  // const handleStatusChange = async (orderId: string, status: OrderStatus) => {
  //   try {
  //     changeOrderStatus(
  //       { orderId, status },
  //       {
  //         onSuccess: (success) => {
  //           if (success) toast.success("Order status updated successfully!");
  //           else toast.error("Failed to update order status");
  //         },
  //       },
  //     );
  //   } catch (error) {
  //     toast.error("Failed to update order status");
  //   }
  // };

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
              <TableHead>Order at Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium text-blue-600">#{order.numericalId}</TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger className="flex gap-8 items-center">
                      <div className="flex items-center gap-2">
                        {order.product.image && (
                          <img src={order.product.image} alt={order.product.name} className="w-8 h-8 rounded-full" />
                        )}
                        {order.product.name}
                      </div>
                      <ChevronDown className="min-w-4 min-h-4 max-h-4 max-w-4" />
                    </PopoverTrigger>
                    <PopoverContent className="w-80 max-h-80 overflow-y-auto">
                      <div className="p-2">
                        <h4 className="font-semibold mb-4">Order Variations</h4>
                        <div className="space-y-4">
                          {order.orderVariations.map((variation, index) => (
                            <>
                              <div key={index} className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                  Size:<span className="font-bold"> {variation.size} </span>
                                </div>
                                <div>
                                  Color:<span className="font-bold"> {variation.color.name} </span>
                                </div>
                                <div>
                                  Order: <span className="font-bold"> {variation.quantity} </span>
                                </div>
                                <div>
                                  Shipped: <span className="font-bold"> {variation.shippedQuantity || "0"} </span>
                                </div>
                              </div>
                              <Separator />
                            </>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>#{order.product.sku}</TableCell>
                <TableCell>
                  {order.orderVariations.reduce((total, variation) => total + variation.quantity, 0)}
                </TableCell>
                <TableCell>
                  {order.orderVariations.reduce((total, { shippedQuantity }) => total + Number(shippedQuantity), 0)}{" "}
                  pieces shipped
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {/* <Popover>
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
                    </Popover> */}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" asChild>
                      <Link to={`/ecommerce/orders/update/${order.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    {currentUser?.userType === "admin" && (
                      <DeleteAlertModal
                        onDelete={() => handleDeleteOrder(order.id)}
                        isDeleting={isDeleting}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                    )}
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
