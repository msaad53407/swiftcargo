import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getColors, addColor } from "@/utils/product";

export default function useColors() {
  const queryClient = useQueryClient();

  const { data: colors = [], isLoading } = useQuery({
    queryKey: ["colors"],
    queryFn: getColors,
  });

  const addColorMutation = useMutation({
    mutationFn: addColor,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["colors"],
        exact: true,
      });
    },
  });

  return {
    colors,
    isLoading,
    addColor: addColorMutation.mutate,
    isAddingColor: addColorMutation.isPending,
  };
}
