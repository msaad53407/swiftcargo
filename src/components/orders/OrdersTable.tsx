import { Button } from "@/components/ui/button";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generatePaginationNUmbers } from "@/lib/utils";
import { CheckCircle, CheckIcon, Loader2, Pencil, Printer, Trash2 } from "lucide-react";

import { useOrders } from "@/hooks/useOrders";
import { Order, OrderStatus } from "@/types/order";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import DeleteAlertModal from "../products/DeleteAlertModal";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
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
} from "../ui/alert-dialog";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { handleBulkPrint } from "./BulkPrintOrders";

type Props = {
  data?: Order[];
  showFooter?: boolean;
  limit?: number;
  isCompletedOrdersData?: boolean;
};

export function OrdersTable({ data: filteredData, showFooter = true, limit, isCompletedOrdersData = false }: Props) {
  const {
    totalPages,
    currentPage,
    setCurrentPage,
    deleteOrder,
    isDeleting,
    changeOrderStatus,
    isChangingStatus,
    changeBulkOrderStatus,
    deleteBulkOrders,
  } = useOrders(limit);
  const [selectedAction, setSelectedAction] = useState<"delete" | "print" | "none" | "changeStatus">("none");
  const { currentUser } = useAuth();

  const [selectedOrders, setSelectedOrders] = useState<Order["id"][]>([]);
  // const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const handleSelectAll = (checked: boolean | string) => {
    if (checked) {
      filteredData && setSelectedOrders(filteredData.map((order) => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (checked: boolean | string, orderId: string) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    }
  };

  const handleBulkAction = async (action: "delete" | "print" | "none" | "changeStatus") => {
    if (action === "none") return;

    if (currentUser?.userType !== "admin" && action === "delete") {
      toast.error("You don't have permission to delete orders");
      return;
    }

    if (selectedOrders.length === 0) {
      toast.error("Please select at least one order");

      return;
    }

    switch (action) {
      case "delete":
        if (window.confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) {
          deleteBulkOrders(selectedOrders, {
            onSuccess: (success) => {
              if (success) {
                toast.success(`Successfully deleted ${selectedOrders.length} orders`);
                setSelectedOrders([]);
              } else {
                toast.error("Failed to delete orders");
              }
            },
            onError: () => {
              toast.error("Failed to delete orders");
            },
          });
        }
        break;
      case "print":
        const selectedOrdersData = filteredData?.filter((order) => selectedOrders.includes(order.id));
        selectedOrdersData && handleBulkPrint(selectedOrdersData, isCompletedOrdersData);
        break;
      case "changeStatus":
        if (window.confirm(`Are you sure you want to mark all selected orders as completed?`)) {
          changeBulkOrderStatus(
            { orderIds: selectedOrders, status: OrderStatus.COMPLETED },
            {
              onSuccess: (success) => {
                if (success) {
                  toast.success(`Successfully changed status`);
                  setSelectedOrders([]);
                } else {
                  toast.error("Failed to change status of orders");
                }
              },
              onError: () => {
                toast.error("Failed to change status of orders");
              },
            },
          );
        }
        break;
      default:
        break;
    }

    setSelectedAction(action);
  };

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
      <div className="flex items-center gap-2">
        <Select onValueChange={(value) => setSelectedAction(value as "delete" | "print" | "none" | "changeStatus")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Bulk Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none" className="text-gray-500">
              <div className="flex items-center gap-2">None</div>
            </SelectItem>
            <SelectItem value="delete" className="text-red-500">
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </div>
            </SelectItem>
            <SelectItem value="changeStatus" className="text-green-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Mark as Completed
              </div>
            </SelectItem>
            <SelectItem value="print">
              <div className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print Selected
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => handleBulkAction(selectedAction)} disabled={!selectedAction}>
          Apply
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={(filteredData?.length ?? 0) > 0 && selectedOrders.length === (filteredData?.length ?? 0)}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Order Id.</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Ordered Quantities</TableHead>
              <TableHead>Status</TableHead>
              {!isCompletedOrdersData ? <TableHead className="text-right">Action</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData?.map((order) => (
              <TableRow key={order.id} className="max-h-[150px] overflow-y-auto">
                <TableCell>
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onCheckedChange={(checked) => handleSelectOrder(checked, order.id)}
                  />
                </TableCell>
                <TableCell className="font-medium text-blue-600">#{order.numericalId}</TableCell>
                <TableCell className="min-w-80">
                  <div className="flex items-center gap-2 ml-2">
                    {order.product.image && (
                      <img src={order.product.image} alt={order.product.name} className="w-8 h-8 rounded-full" />
                    )}
                    <span className="text-xl">{order.product.name}</span>
                  </div>
                  <div className="p-2">
                    <h4 className="font-semibold mb-4">Order Variations</h4>
                    <div className="space-y-4">
                      {order.orderVariations.length > 0 ? (
                        order.orderVariations.map((variation, index) => (
                          <>
                            <Separator />
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
                          </>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No variations found</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>#{order.product.sku}</TableCell>
                <TableCell>
                  {order.orderVariations.reduce((total, variation) => total + variation.quantity, 0)}
                </TableCell>
                <TableCell>
                  {order.orderVariations.reduce((total, { shippedQuantity }) => total + Number(shippedQuantity), 0)}{" "}
                  pieces shipped
                </TableCell>
                {!isCompletedOrdersData ? (
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {currentUser && currentUser.userType === "admin" && order.status !== OrderStatus.COMPLETED && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="flex items-center justify-start"
                              variant="ghost"
                              disabled={isChangingStatus}
                            >
                              <CheckIcon className="h-4 w-4 text-green-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to mark this order as completed? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleStatusChange(order.id, OrderStatus.COMPLETED)}
                                disabled={isChangingStatus}
                              >
                                {isChangingStatus ? (
                                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                ) : (
                                  <CheckIcon className="h-4 w-4 mr-2" />
                                )}
                                <span>Mark as completed</span>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
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
                ) : null}
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
