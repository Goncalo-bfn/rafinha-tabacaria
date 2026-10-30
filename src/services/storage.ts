import { supabase, supabaseUrl } from "../lib/supabase";

export const PRODUCT_IMAGE_BUCKET = "products";
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const PRODUCT_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

/** Retorna uma mensagem de erro ou `null` se o arquivo for válido. */
export function validateProductImage(file: File): string | null {
  if (!MIME_EXTENSIONS[file.type]) {
    return "Formato inválido. Envie uma imagem JPEG, PNG ou WebP.";
  }

  if (file.size === 0) {
    return "O arquivo selecionado está vazio.";
  }

  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    return "A imagem excede o limite de 5 MB.";
  }

  return null;
}

function buildUniqueObjectPath(file: File): string {
  const extension = MIME_EXTENSIONS[file.type] ?? "bin";
  const uniqueId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `${uniqueId}.${extension}`;
}

export type UploadedProductImage = {
  path: string;
  publicUrl: string;
};

export async function uploadProductImage(
  file: File,
): Promise<UploadedProductImage> {
  const invalid = validateProductImage(file);

  if (invalid) {
    throw new Error(invalid);
  }

  const path = buildUniqueObjectPath(file);

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    if (/row-level security|not authorized|permission/i.test(error.message)) {
      throw new Error(
        "Sem permissão para enviar imagens. É necessário estar autenticado como administrador.",
      );
    }

    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(path);

  return { path, publicUrl: data.publicUrl };
}

function isSafeObjectPath(path: string): boolean {
  return (
    path.length > 0 &&
    !path.startsWith("/") &&
    !path.includes("..") &&
    !path.includes("\\") &&
    /^[A-Za-z0-9._/-]+$/.test(path)
  );
}

/**
 * Só reconhece caminhos do bucket `products` do nosso projeto.
 * URLs externas (outro host, outro bucket) retornam `null` e nunca são apagadas.
 */
function extractManagedObjectPath(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (/^[a-z]+:\/\//i.test(trimmed)) {
    let parsed: URL;

    try {
      parsed = new URL(trimmed);
    } catch {
      return null;
    }

    if (parsed.host !== new URL(supabaseUrl).host) {
      return null;
    }

    const prefix = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;

    if (!parsed.pathname.startsWith(prefix)) {
      return null;
    }

    let decoded: string;

    try {
      decoded = decodeURIComponent(parsed.pathname.slice(prefix.length));
    } catch {
      return null;
    }

    return isSafeObjectPath(decoded) ? decoded : null;
  }

  return isSafeObjectPath(trimmed) ? trimmed : null;
}

/**
 * Remove a imagem do bucket apenas quando ela pertence ao caminho esperado.
 * Retorna `true` se o arquivo foi removido, `false` se foi ignorado.
 */
export async function deleteProductImage(
  value: string | null | undefined,
): Promise<boolean> {
  if (!value) {
    return false;
  }

  const path = extractManagedObjectPath(value);

  if (!path) {
    return false;
  }

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .remove([path]);

  return !error;
}
