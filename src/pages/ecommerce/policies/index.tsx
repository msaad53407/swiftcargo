import { AddPolicyDialog } from "@/components/employees/AddPolicyModal";
import { DeletePolicyDialog } from "@/components/employees/DeletePolicyModal";
import { PolicyEditor } from "@/components/employees/PolicyEditor";
import { PolicySkeleton } from "@/components/employees/PolicySkeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePolicies } from "@/hooks/usePolicies";
import { format } from "date-fns";
import { Loader2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

export default function PoliciesPage() {
  const {
    policies,
    loading,
    error,
    selectedPolicy,
    fetchPolicies,
    handleAddPolicy,
    handleUpdatePolicy,
    handleDeletePolicy,
    handleSetActivePolicy,
    addingPolicy,
    updatingPolicy,
    deletingPolicy,
    settingActivePolicy,
  } = usePolicies();

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isEditing, setIsEditing] = useState("");

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const deleteHandler = async (id: string) => {
    await handleDeletePolicy(id);
  };

  if (error) {
    return (
      <div className="container py-10 flex justify-center">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Employees Policy</h1>
          <p className="text-sm text-muted-foreground">Departmental Member's Information Details</p>
        </div>
        <AddPolicyDialog onAddPolicy={handleAddPolicy} addingPolicy={addingPolicy} />
      </div>

      <div className="bg-white rounded-lg border p-6">
        {loading ? (
          <PolicySkeleton />
        ) : (
          <RadioGroup value={selectedPolicy?.id} onValueChange={handleSetActivePolicy}>
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="flex flex-col 
              space-y-4 py-4"
              >
                <div className="flex items-start gap-2">
                  <RadioGroupItem
                    value={policy.id}
                    id={policy.id}
                    disabled={settingActivePolicy}
                    checked={policy.isActive}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={policy.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {policy.title}
                      </label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            if (isEditing) {
                              setIsEditing("");
                              return;
                            }
                            setIsEditing(policy.id);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DeletePolicyDialog onDelete={() => deleteHandler(policy.id)} deleting={deletingPolicy} />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1.5">
                      Last updated: {format(policy.lastUpdated, "dd MMM, yyyy")}
                    </p>
                    <div
                      className="mt-2 text-sm prose max-w-none line-clamp-4"
                      dangerouslySetInnerHTML={{ __html: policy.content }}
                    />
                  </div>
                </div>
                {isEditing && isEditing === policy.id && (
                  <div className="mt-6 space-y-4">
                    <PolicyEditor content={policy.content} onChange={(content) => (policy.content = content)} />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditing("")}>
                        Cancel
                      </Button>
                      <Button
                        onClick={async () => {
                          const success = await handleUpdatePolicy(policy.id, {
                            content: policy.content,
                          });
                          if (success) {
                            setIsEditing("");
                            setShowSuccessDialog(true);
                          }
                        }}
                        disabled={updatingPolicy}
                      >
                        {updatingPolicy ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </RadioGroup>
        )}
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="rounded-full bg-green-100 p-3">
              <div className="rounded-full bg-green-500 p-4">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-center text-lg font-semibold">You have edited your Employees Policy</p>
            <Button onClick={() => setShowSuccessDialog(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
