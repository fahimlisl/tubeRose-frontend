import { useEffect, useState } from "react";
import { publicProductApi } from "../api/public.api";
import { IProduct } from "../../interfaces/product.interface";

export function useProducts() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    publicProductApi
      .getAll()
      .then((res) => {
        setProducts(res.data ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}