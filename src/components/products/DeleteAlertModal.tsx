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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const DeleteAlertModal = ({
  onDelete,
  trigger,
  isDeleting,
  bypassAuthorization = false,
}: {
  onDelete: () => Promise<void>;
  trigger: React.ReactNode;
  isDeleting: boolean;
  bypassAuthorization?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuth();
  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        if (currentUser && currentUser.userType === "manager" && !bypassAuthorization) {
          toast.error("Unauthorized. Only Admins can delete.");
          return;
        }
        setOpen(open);
      }}
    >
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
            onClick={async (e) => {
              e.preventDefault();
              setOpen(true);
              onDelete().then(() => {
                setOpen(false);
              });
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAlertModal;
