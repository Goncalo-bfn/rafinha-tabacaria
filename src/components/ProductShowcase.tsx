import { useEffect, useMemo, useState } from "react";
import { demoProducts } from "../data/products";
import type { ProductsStatus } from "../hooks/useProducts";
import {
  collectCategories,
  filterProductsByCategory,
} from "../lib/categories";
import type { Product } from "../types/product";
import { CategoryFilter } from "./CategoryFilter";
import { ProductCard } from "./ProductCard";

const isDev = import.meta.env.DEV;

type ProductShowcaseProps = {
  products: Product[];
  status: ProductsStatus;
  error: string | null;
  reload: () => void;
};

export function ProductShowcase({
  error,
  products,
  reload,
  status,
}: ProductShowcaseProps) {
  const isEmpty = status === "ready" && products.length === 0;
  const showDemo = isDev && (status === "error" || isEmpty);

  const categories = useMemo(() => collectCategories(products), [products]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Se a categoria selecionada deixar de existir (produto desativado/excluído),
  // volta para "Todas" em vez de deixar a vitrine vazia.
  useEffect(() => {
    if (
      selectedCategory !== null &&
      !categories.some((category) => category.name === selectedCategory)
    ) {
      setSelectedCategory(null);
    }
  }, [categories, selectedCategory]);

  const visibleProducts = useMemo(
    () => filterProductsByCategory(products, selectedCategory),
    [products, selectedCategory],
  );

  return (
    <section
      aria-labelledby="showcase-title"
      className="scroll-mt-16 bg-ink text-ink-foreground"
      id="vitrine"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="mb-12">
          <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-ink-muted">
            <span aria-hidden="true" className="h-px w-8 bg-accent" />
            Produtos
          </p>
          <h2
            className="font-display text-5xl uppercase leading-none text-ink-foreground sm:text-6xl"
            id="showcase-title"
          >
            Vitrine
          </h2>
        </div>

        {showDemo ? (
          <div className="mb-6 border border-dashed border-ink-border p-4 text-xs text-ink-muted">
            <p>
              Ambiente de desenvolvimento: exibindo produtos de exemplo porque{" "}
              {status === "error"
                ? "a consulta ao Supabase falhou."
                : "a vitrine não retornou produtos."}
            </p>
            {error ? <p className="mt-4">{error}</p> : null}
            {status === "error" ? (
              <button
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-4 text-xs font-semibold uppercase tracking-[0.15em] text-accent-foreground transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                onClick={reload}
                type="button"
              >
                Tentar novamente
              </button>
            ) : null}
          </div>
        ) : null}

        {status === "loading" ? (
          <ul
            aria-busy="true"
            aria-label="Carregando produtos"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <li
                className="overflow-hidden border border-ink-border bg-ink-card"
                key={index}
              >
                <div className="aspect-[4/5] animate-pulse bg-ink" />
                <div className="flex flex-col gap-3 p-5">
                  <div className="h-8 w-full animate-pulse rounded-sm bg-ink" />
                  <div className="h-4 w-full animate-pulse rounded-sm bg-ink" />
                  <div className="h-4 w-full animate-pulse rounded-sm bg-ink" />
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {showDemo ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {demoProducts.map((product) => (
              <ProductCard demo key={product.id} product={product} />
            ))}
          </ul>
        ) : null}

        {!showDemo && status === "ready" && products.length > 0 ? (
          <>
            {categories.length > 0 ? (
              <CategoryFilter
                categories={categories}
                onSelect={setSelectedCategory}
                selected={selectedCategory}
                totalCount={products.length}
              />
            ) : null}

            {visibleProducts.length > 0 ? (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ul>
            ) : (
              <div className="border border-dashed border-ink-border p-6 text-center">
                <p className="text-sm text-ink-muted">
                  Nenhum produto nesta categoria no momento.
                </p>
              </div>
            )}
          </>
        ) : null}

        {!showDemo && isEmpty ? (
          <div className="border border-dashed border-ink-border p-6 text-center">
            <p className="text-sm text-ink-muted">
              Nenhum produto disponível no momento. Volte em breve.
            </p>
          </div>
        ) : null}

        {!showDemo && status === "error" ? (
          <div className="border border-dashed border-ink-border p-6 text-center">
            <p className="text-sm text-ink-muted">
              Não foi possível carregar a vitrine agora.
            </p>
            <button
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-4 text-xs font-semibold uppercase tracking-[0.15em] text-accent-foreground transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              onClick={reload}
              type="button"
            >
              Tentar novamente
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
