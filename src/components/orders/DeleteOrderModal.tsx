import { deleteOrder } from "@/utils/order";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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

const DeleteOrderModal = ({ id, trigger }: { id: string; trigger: React.ReactNode }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const Navigate = useNavigate();

  const deleteOrderHandler = async (id: string) => {
    setActionLoading(true);
    const result = await deleteOrder(id);
    if (result) {
      toast.success("Product deleted successfully!");
      setActionLoading(false);
      Navigate({ pathname: "/ecommerce/orders" });
      return;
    }

    setActionLoading(false);
    toast.error("Failed to delete product!");
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the selected order.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 text-white hover:bg-red-800"
            onClick={() => deleteOrderHandler(id)}
            disabled={actionLoading}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteOrderModal;
