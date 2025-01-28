import { Color } from "@/types/product";
import { getColors } from "@/utils/product";
import { useCallback, useEffect, useState } from "react";

export default function useColors() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchColors = useCallback(async () => {
    setLoading(true);
    const result = await getColors();
    setColors(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  return { colors, loading };
}
