import { useState, useCallback } from "react";
import type { Policy } from "@/types/policy";
import { getPolicies, addPolicy, updatePolicy, deletePolicy, setActivePolicy } from "@/utils/employeePolicies";

interface UsePoliciesReturn {
  policies: Policy[];
  loading: boolean;
  error: Error | null;
  selectedPolicy: Policy | null;
  fetchPolicies: () => Promise<void>;
  handleAddPolicy: (title: string, content: string) => Promise<boolean>;
  handleUpdatePolicy: (id: string, data: Partial<Policy>) => Promise<boolean>;
  handleDeletePolicy: (id: string) => Promise<boolean>;
  handleSetActivePolicy: (id: string) => Promise<boolean>;
  setSelectedPolicy: (policy: Policy | null) => void;
  addingPolicy: boolean;
  updatingPolicy: boolean;
  deletingPolicy: boolean;
  settingActivePolicy: boolean;
}

export function usePolicies(): UsePoliciesReturn {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [addingPolicy, setAddingPolicy] = useState(false);
  const [updatingPolicy, setUpdatingPolicy] = useState(false);
  const [deletingPolicy, setDeletingPolicy] = useState(false);
  const [settingActivePolicy, setSettingActivePolicy] = useState(false);

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPolicies = await getPolicies();
      setPolicies(fetchedPolicies);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch policies"));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddPolicy = async (title: string, content: string): Promise<boolean> => {
    try {
      setAddingPolicy(true);
      const success = await addPolicy(title, content);
      if (success) {
        await fetchPolicies();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to add policy"));
      return false;
    } finally {
      setAddingPolicy(false);
    }
  };

  const handleUpdatePolicy = async (id: string, data: Partial<Policy>): Promise<boolean> => {
    try {
      setUpdatingPolicy(true);
      const success = await updatePolicy(id, data);
      if (success) {
        await fetchPolicies();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update policy"));
      return false;
    } finally {
      setUpdatingPolicy(false);
    }
  };

  const handleDeletePolicy = async (id: string): Promise<boolean> => {
    try {
      setDeletingPolicy(true);
      const success = await deletePolicy(id);
      if (success) {
        await fetchPolicies();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to delete policy"));
      return false;
    } finally {
      setDeletingPolicy(false);
    }
  };

  const handleSetActivePolicy = async (id: string): Promise<boolean> => {
    try {
      setSettingActivePolicy(true);
      const success = await setActivePolicy(id);
      if (success) {
        await fetchPolicies();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to set active policy"));
      return false;
    } finally {
      setSettingActivePolicy(false);
    }
  };

  return {
    policies,
    loading,
    error,
    selectedPolicy,
    fetchPolicies,
    handleAddPolicy,
    handleUpdatePolicy,
    handleDeletePolicy,
    handleSetActivePolicy,
    setSelectedPolicy,
    addingPolicy,
    updatingPolicy,
    deletingPolicy,
    settingActivePolicy,
  };
}
