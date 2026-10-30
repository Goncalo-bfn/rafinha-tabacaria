import { supabase } from "../lib/supabase";
import type { Product, ProductInput } from "../types/product";

/**
 * `price` é `numeric` no banco e pode chegar como string dependendo do driver.
 * Normalizamos para number antes de expor ao restante da aplicação.
 */
type ProductRow = Omit<Product, "price"> & { price: number | string };

type SupabaseError = { code?: string; message: string };

function toProduct(row: ProductRow): Product {
  return {
    ...row,
    price: Number(row.price),
  };
}

function toFriendlyError(error: SupabaseError): Error {
  if (
    error.code === "42501" ||
    /row-level security|permission denied/i.test(error.message)
  ) {
    return new Error(
      "Sem permissão para alterar produtos. É necessário estar autenticado como administrador.",
    );
  }

  return new Error(error.message);
}

export async function fetchActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw toFriendlyError(error);
  }

  const rows = (data as ProductRow[] | null) ?? [];

  return rows.map(toProduct);
}

/** Listagem completa (inclui inativos). A RLS só libera para administradores. */
export async function fetchAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw toFriendlyError(error);
  }

  const rows = (data as ProductRow[] | null) ?? [];

  return rows.map(toProduct);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw toFriendlyError(error);
  }

  return toProduct(data as ProductRow);
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw toFriendlyError(error);
  }

  return toProduct(data as ProductRow);
}

export async function updateProductActive(
  id: string,
  active: boolean,
): Promise<void> {
  const { data, error } = await supabase
    .from("products")
    .update({ active })
    .eq("id", id)
    .select("id");

  if (error) {
    throw toFriendlyError(error);
  }

  if (!data || data.length === 0) {
    throw new Error(
      "O produto não foi encontrado ou você não tem permissão para alterá-lo.",
    );
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    throw toFriendlyError(error);
  }

  if (!data || data.length === 0) {
    throw new Error(
      "O produto não foi encontrado ou você não tem permissão para excluí-lo.",
    );
  }
}
