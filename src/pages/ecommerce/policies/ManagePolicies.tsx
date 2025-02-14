import { AddPolicyDialog } from "@/components/employees/AddPolicyModal";
import { DeletePolicyDialog } from "@/components/employees/DeletePolicyModal";
import { PolicyEditor } from "@/components/employees/PolicyEditor";
import { PolicySkeleton } from "@/components/employees/PolicySkeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { usePolicies } from "@/hooks/usePolicies";
import { Policy } from "@/types/policy";
import { format } from "date-fns";
import { Loader2, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ManagePoliciesPage() {
  const {
    policies,
    isLoading: loading,
    error,
    selectedPolicy,
    addPolicy,
    updatePolicy,
    deletePolicy,
    setActivePolicy,
    isAddingPolicy,
    isUpdatingPolicy,
    isDeletingPolicy,
    isSettingActivePolicy,
  } = usePolicies();

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isEditing, setIsEditing] = useState("");

  const handleAddPolicy = async (title: string, content: string, policyType: string) => {
    if (currentUser && currentUser.userType === "manager") {
      toast.error("Unauthorized. Only Admins can add policies.");
      return false;
    }
    addPolicy(
      { title, content, policyType },
      {
        onSettled(success) {
          return !!success;
        },
      },
    );
    return true;
  };

  const renderPolicies = (policies: Policy[]) => {
    return (
      <RadioGroup
        value={selectedPolicy?.id}
        onValueChange={(id) => {
          setActivePolicy(id || "");
        }}
      >
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
                disabled={isSettingActivePolicy}
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
                        if (currentUser && currentUser.userType === "manager") {
                          toast.error("Unauthorized. Only Admins can edit policies.");
                          return;
                        }
                        if (isEditing) {
                          setIsEditing("");
                          return;
                        }
                        setIsEditing(policy.id);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DeletePolicyDialog
                      onDelete={async () => {
                        deletePolicy(policy.id);
                      }}
                      deleting={isDeletingPolicy}
                    />
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
                      updatePolicy(
                        {
                          id: policy.id,
                          data: policy,
                        },
                        {
                          onSuccess: (success) => {
                            if (success) {
                              setIsEditing("");
                              setShowSuccessDialog(true);
                            }
                          },
                        },
                      );
                    }}
                    disabled={isUpdatingPolicy}
                  >
                    {isUpdatingPolicy ? (
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
    );
  };

  if (error) {
    return (
      <div className="container py-10 flex justify-center">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  if (currentUser && currentUser.userType === "manager") {
    toast.error("Unauthorized. Only Admins can add policies.");
    setTimeout(() => {
      navigate("/ecommerce/policies");
    }, 2000);
    return null;
  }

  return (
    <div className="container py-10 px-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Manage Policies</h1>
        </div>
        <AddPolicyDialog onAddPolicy={handleAddPolicy} addingPolicy={isAddingPolicy} />
      </div>

      <div className="bg-white rounded-lg border p-6">
        {loading ? (
          <PolicySkeleton />
        ) : (
          <Tabs defaultValue="employeePolicies">
            <TabsList>
              <TabsTrigger value="employeePolicies">Employee</TabsTrigger>
              <TabsTrigger value="customerPolicies">Customer</TabsTrigger>
            </TabsList>
            <TabsContent value="employeePolicies" className="w-full">
              {renderPolicies(policies.filter((p) => p.type === "employee"))}
            </TabsContent>
            <TabsContent value="customerPolicies" className="w-full">
              {renderPolicies(policies.filter((p) => p.type === "customer"))}
            </TabsContent>
          </Tabs>
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
