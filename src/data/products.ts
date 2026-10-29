export type ProductPlaceholder = {
  id: number;
  name: string;
  description: string;
  price: string;
};

export const productPlaceholders: ProductPlaceholder[] = Array.from(
  { length: 6 },
  (_, index) => ({
    id: index + 1,
    name: `[Nome do produto ${index + 1}]`,
    description: "[Descrição do produto — editar]",
    price: "[Preço]",
  }),
);
