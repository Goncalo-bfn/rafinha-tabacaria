import { useCallback, useEffect, useState } from "react";
import { fetchAllProducts } from "../services/products";
import type { Product } from "../types/product";

export type AdminProductsStatus = "loading" | "error" | "ready";

type UseAdminProductsResult = {
  products: Product[];
  status: AdminProductsStatus;
  error: string | null;
  refresh: () => void;
};

export function useAdminProducts(): UseAdminProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<AdminProductsStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setStatus("loading");
    setError(null);

    fetchAllProducts()
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
          cause instanceof Error
            ? cause.message
            : "Não foi possível carregar os produtos.",
        );
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const refresh = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  return { error, products, refresh, status };
}
