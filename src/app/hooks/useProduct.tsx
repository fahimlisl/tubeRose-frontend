import { useEffect, useState } from "react";
import { publicProductApi } from "../api/public.api";
import { IProduct } from "../../interfaces/product.interface.ts";

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    publicProductApi
      .getById(id)
      .then((res) => {
        setProduct(res.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading, error };
}