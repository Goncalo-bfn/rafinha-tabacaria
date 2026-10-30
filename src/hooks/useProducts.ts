import { useCallback, useEffect, useState } from "react";
import { fetchActiveProducts } from "../services/products";
import type { Product } from "../types/product";

export type ProductsStatus = "loading" | "error" | "ready";

type UseProductsResult = {
  products: Product[];
  status: ProductsStatus;
  error: string | null;
  reload: () => void;
};

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<ProductsStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setStatus("loading");
    setError(null);

    fetchActiveProducts()
      .then((data) => {
        if (cancelled) {
          return;
        }

        setProducts(data);
        setStatus("ready");
      })
      .catch((cause: unknown) => {
        if (cancelled) {
          return;
        }

        setProducts([]);
        setError(
          cause instanceof Error ? cause.message : "Não foi possível carregar os produtos.",
        );
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const reload = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  return { error, products, reload, status };
}
