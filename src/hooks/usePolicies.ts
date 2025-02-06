import type { Policy } from "@/types/policy";
import { addPolicy, deletePolicy, getPolicies, setActivePolicy, updatePolicy } from "@/utils/employeePolicies";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function usePolicies() {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const queryClient = useQueryClient();

  const {
    data: policies = [],
    isLoading,
    error,
  } = useQuery<Policy[]>({
    queryKey: ["policies"],
    queryFn: getPolicies,
  });

  const addPolicyMutation = useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) => addPolicy(title, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["policies"],
        exact: true,
      });
    },
  });

  const updatePolicyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Policy> }) => updatePolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["policies"],
        exact: true,
      });
    },
  });

  const deletePolicyMutation = useMutation({
    mutationFn: deletePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["policies"],
        exact: true,
      });
    },
  });

  const setActivePolicyMutation = useMutation({
    mutationFn: setActivePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["policies"],
        exact: true,
      });
    },
  });

  return {
    policies,
    isLoading,
    error,
    selectedPolicy,
    setSelectedPolicy,
    addPolicy: addPolicyMutation.mutate,
    updatePolicy: updatePolicyMutation.mutate,
    deletePolicy: deletePolicyMutation.mutate,
    setActivePolicy: setActivePolicyMutation.mutate,
    isAddingPolicy: addPolicyMutation.isPending,
    isUpdatingPolicy: updatePolicyMutation.isPending,
    isDeletingPolicy: deletePolicyMutation.isPending,
    isSettingActivePolicy: setActivePolicyMutation.isPending,
  };
}
