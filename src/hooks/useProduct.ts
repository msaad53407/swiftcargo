import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProduct, updateProduct, deleteProduct } from "@/utils/product";
import { useState, useEffect } from "react";
import type { Color, Variation } from "@/types/product";

export default function useProduct(id: string | undefined) {
  const [colorVariations, setColorVariations] = useState<Record<string, Color[]>>({});
  const queryClient = useQueryClient();

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { productData: any; variations: Variation[] }) =>
      updateProduct(id!, data.productData, data.variations),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product", id],
        exact: true,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product", id],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["productsCount"],
        exact: true,
      });
    },
  });

  useEffect(() => {
    if (product) {
      setColorVariations(transformAndSortVariations(product.variations));
    }
  }, [product]);

  const transformAndSortVariations = (variations: Variation[]) => {
    return Object.fromEntries(
      Object.entries(
        variations.reduce<Record<string, Color[]>>(
          (acc, variation) => ({ ...acc, [variation.size]: variation.colors }),
          {},
        ),
      ).sort((a, b) => b[0].localeCompare(a[0])),
    );
  };

  return {
    product,
    isLoading,
    error,
    colorVariations,
    setColorVariations,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    variations: product?.variations,
  };
}
