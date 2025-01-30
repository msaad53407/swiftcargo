import { deleteProduct } from "@/utils/product";
import { useState } from "react";
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
import { useNavigate } from "react-router-dom";

const DeleteAlertModal = ({ id, trigger }: { id: string; trigger: React.ReactNode }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const Navigate = useNavigate();
  const deleteProductHandler = async (id: string) => {
    setActionLoading(true);
    const result = await deleteProduct(id);
    if (result) {
      setActionLoading(false);
      toast.success("Product deleted successfully!");
      Navigate({ pathname: "/ecommerce/products" });
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
            This action cannot be undone. This will permanently delete the selected product and all its variations.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 text-white hover:bg-red-800"
            onClick={() => deleteProductHandler(id)}
            disabled={actionLoading}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAlertModal;
