export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** Campos graváveis pelo painel (id e timestamps são gerados pelo banco). */
export type ProductInput = {
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  active: boolean;
  sort_order: number;
};
