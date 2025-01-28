import Loader from "@/components/Loader";
import { ProductsTable } from "@/components/products/ProductsTable";
import { Product } from "@/types/product";
import { getProducts } from "@/utils/product";
import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const limit = 10;
  useEffect(() => {
    const fetchProducts = async () => {
      const products = await getProducts(limit);
      setProducts(products);
    };
    fetchProducts().then(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  if (products.length === 0)
    return (
      <div className="container py-10 flex h-screen justify-center items-center">
        <p>No products found</p>
      </div>
    );

  return (
    <div className="container py-10">
      <ProductsTable data={products} />
    </div>
  );
}
