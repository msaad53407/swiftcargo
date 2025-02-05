import { db } from "@/firebase/config";
import { Order } from "@/types/order";
import { Product } from "@/types/product";
import { collection, getDocs, query, Timestamp, where } from "firebase/firestore";

const getMonthName = (date: Date): string => {
  return date.toLocaleString("default", { month: "long" });
};

export const getMonthlyOrderCount = async (): Promise<{ month: string; orders: number }[]> => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const twelveMonthsAgoTimestamp = new Timestamp(
      twelveMonthsAgo.getSeconds(),
      twelveMonthsAgo.getMilliseconds() / 1000000,
    );

    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("createdAt", ">=", twelveMonthsAgo));

    const querySnapshot = await getDocs(q);

    const monthlyOrders: { [key: string]: number } = {};
    querySnapshot.forEach((doc) => {
      const orderData = {
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString(),
      } as Order;
      const orderDate = new Date(orderData.createdAt);
      const monthName = getMonthName(orderDate);

      monthlyOrders[monthName] = (monthlyOrders[monthName] || 0) + 1;
    });

    const allMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    console.log(monthlyOrders);
    return allMonths.map((month) => ({
      month,
      orders: monthlyOrders[month] || 0,
    }));
  } catch (error) {
    console.error("Error fetching monthly order count:", error);
    return [];
  }
};

export const getTopSellingProducts = async (): Promise<{ name: string; value: number }[]> => {
  try {
    const ordersRef = collection(db, "orders");
    const productsRef = collection(db, "products");

    const ordersSnapshot = await getDocs(ordersRef);

    const productCounts: { [productId: string]: number } = {};

    ordersSnapshot.forEach((doc) => {
      const orderData = doc.data() as Order;
      const productId = orderData.product.id;

      productCounts[productId] = (productCounts[productId] || 0) + 1;
    });

    const productsQuery = query(productsRef);
    const productsSnapshot = await getDocs(productsQuery);

    const topProducts: { name: string; value: number }[] = [];

    productsSnapshot.forEach((doc) => {
      const productData = doc.data() as Product;
      const count = productCounts[doc.id] || 0;

      if (count > 0) {
        topProducts.push({
          name: productData.name,
          value: count,
        });
      }
    });

    return topProducts.sort((a, b) => b.value - a.value).slice(0, 4); // Top 4 products
  } catch (error) {
    console.error("Error fetching top-selling products:", error);
    return [];
  }
};
