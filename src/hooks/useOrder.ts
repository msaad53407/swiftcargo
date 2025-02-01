import { Order } from "@/types/order";
import { getOrder } from "@/utils/order";
import { useEffect, useState } from "react";

export default function useOrder(id: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const order = await getOrder(id);
        setOrder(order);
        return order;
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  return { loading, order };
}
