import type { Product } from "../types/product";

export type ProductCategory = {
  name: string;
  count: number;
};

/** Categoria normalizada: sem espaços nas pontas e vazia vira `null`. */
export function normalizeCategoryName(
  value: string | null | undefined,
): string | null {
  const name = value?.trim();

  return name ? name : null;
}

/**
 * Deriva as categorias exclusivamente dos produtos ativos já carregados do
 * Supabase. A ordem é alfabética (pt-BR) para a lista ficar estável mesmo
 * quando a ordem dos produtos muda. Produtos sem categoria não geram opção
 * própria (continuam visíveis em "Todas").
 */
export function collectCategories(products: Product[]): ProductCategory[] {
  const counts = new Map<string, number>();

  for (const product of products) {
    const name = normalizeCategoryName(product.category);

    if (!name) {
      continue;
    }

    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return Array.from(counts, ([name, count]) => ({ count, name })).sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
  );
}

/** `null` representa "Todas": devolve o catálogo completo. */
export function filterProductsByCategory(
  products: Product[],
  category: string | null,
): Product[] {
  if (!category) {
    return products;
  }

  return products.filter(
    (product) => normalizeCategoryName(product.category) === category,
  );
}
