import { PolicySkeleton } from "@/components/employees/PolicySkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePolicies } from "@/hooks/usePolicies";
import { Policy } from "@/types/policy";
import { ErrorMessage } from "../settings";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

export default function PoliciesPage() {
  const { policies, isLoading: loading, error } = usePolicies();
  const { currentUser } = useAuth();

  const renderPolicy = (policies: Policy[]) => {
    return (
      <div>
        {policies.length > 0 ? (
          policies.map((p) => (
            <div className="space-y-4">
              <h2 className="text-4xl my-4">{p.title}</h2>
              <p dangerouslySetInnerHTML={{ __html: p.content }}></p>
            </div>
          ))
        ) : (
          <ErrorMessage message="No active policies found" />
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="container py-10 flex justify-center">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container py-10 px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Active Policies</h1>
        {currentUser && currentUser.userType === "admin" && (
          <Link to="/ecommerce/policies/manage">
            <Settings />
          </Link>
        )}
      </div>
      <div className="bg-white rounded-lg p-6 border">
        {loading ? (
          <PolicySkeleton />
        ) : (
          <Tabs defaultValue="employeePolicies">
            <TabsList>
              <TabsTrigger value="employeePolicies">Employee</TabsTrigger>
              <TabsTrigger value="customerPolicies">Customer</TabsTrigger>
            </TabsList>
            <TabsContent value="employeePolicies" className="w-full">
              {renderPolicy(policies.filter((p) => p.type === "employee" && p.isActive))}
            </TabsContent>
            <TabsContent value="customerPolicies" className="w-full">
              {renderPolicy(policies.filter((p) => p.type === "customer" && p.isActive))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
