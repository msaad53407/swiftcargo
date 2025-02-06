"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PolicyEditor } from "./PolicyEditor";
import { Loader2, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AddPolicyDialogProps {
  onAddPolicy: (title: string, content: string) => Promise<boolean>;
  addingPolicy: boolean;
}

export function AddPolicyDialog({ onAddPolicy, addingPolicy }: AddPolicyDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { currentUser } = useAuth();

  const handleSubmit = async () => {
    const success = await onAddPolicy(title, content);
    if (success) {
      setTitle("");
      setContent("");
      setOpen(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (currentUser && currentUser.userType === "manager") {
          setOpen(false);
          toast.error("Unauthorized. Only Admins can add policies.");
          return;
        }
        setOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Policy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Policy</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Policy Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter policy title"
            />
          </div>
          <div className="grid gap-2">
            <Label>Policy Content</Label>
            <PolicyEditor content={content} onChange={setContent} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={addingPolicy} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title || !content || addingPolicy}>
            {addingPolicy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Policy...
              </>
            ) : (
              "Add Policy"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
