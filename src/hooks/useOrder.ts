import { getOrder, updateOrder, updateOrderSchema } from "@/utils/order";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

export default function useOrder(id: string | undefined) {
  const queryClient = useQueryClient();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id!),
    enabled: !!id,
  });

  const updateOrderMutation = useMutation({
    mutationFn: (data: z.infer<typeof updateOrderSchema>) => updateOrder(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["order", id],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },
  });

  return {
    order,
    isLoading,
    error,
    updateOrder: updateOrderMutation.mutate,
    isUpdating: updateOrderMutation.isPending,
  };
}
