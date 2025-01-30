import { SIZES } from "@/components/products/Variations";
import { Color, Product, Variation } from "@/types/product";
import { getProduct } from "@/utils/product";
import { useEffect, useState } from "react";

export default function useProduct(id: string | undefined) {
  const [colorVariations, setColorVariations] = useState<Record<string, Color[]>>({});
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const product = await getProduct(id);
        setProduct(product);
        if (product) {
          setColorVariations(transformAndSortVariations(product.variations));
          setVariations(product.variations);
        }
        return product;
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const transformAndSortVariations = (variations: Variation[]) => {
    return Object.fromEntries(
      Object.entries(
        variations.reduce<Record<string, Color[]>>(
          (acc, variation) => ({ ...acc, [variation.size]: variation.colors }),
          {},
        ),
      ).sort(([a], [b]) => SIZES.indexOf(a as (typeof SIZES)[number]) - SIZES.indexOf(b as (typeof SIZES)[number])),
    );
  };

  return { colorVariations, loading, product, setColorVariations, variations };
}
