import type { Product } from "../types/product";

const demoDate = "2026-01-01T00:00:00.000Z";

/**
 * Fallback exclusivo de desenvolvimento: usado quando a consulta ao Supabase
 * falha ou retorna vazio. Nunca é exibido em produção.
 */
export const demoProducts: Product[] = Array.from(
  { length: 6 },
  (_, index) => ({
    id: `demo-${index + 1}`,
    name: `[Nome do produto ${index + 1}]`,
    description: "[Descrição do produto — editar]",
    price: 0,
    image_url: null,
    category: null,
    active: true,
    sort_order: index + 1,
    created_at: demoDate,
    updated_at: demoDate,
  }),
);
