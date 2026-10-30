import { formatPrice } from "./format";

export const CART_STORAGE_KEY = "rafinha-tabacaria.cart.v1";
export const MAX_CART_QUANTITY = 99;
export const MAX_CART_LINES = 50;

/** O que é persistido no localStorage: apenas id + quantidade. */
export type CartEntry = {
  id: string;
  quantity: number;
};

/** Linha exibida no carrinho, sempre derivada dos produtos atuais do Supabase. */
export type CartLine = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  subtotal: number;
};

export function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(MAX_CART_QUANTITY, Math.max(1, Math.trunc(value)));
}

/**
 * Valida o conteúdo lido do storage. Entradas inválidas, duplicadas ou fora
 * dos limites são descartadas para que um storage corrompido nunca quebre a
 * loja.
 */
export function normalizeCartEntries(value: unknown): CartEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const entries: CartEntry[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const { id, quantity } = item as { id?: unknown; quantity?: unknown };

    if (typeof id !== "string" || !id.trim() || seen.has(id)) {
      continue;
    }

    const parsedQuantity =
      typeof quantity === "number" ? quantity : Number(quantity);

    if (!Number.isFinite(parsedQuantity)) {
      continue;
    }

    seen.add(id);
    entries.push({ id, quantity: clampQuantity(parsedQuantity) });

    if (entries.length >= MAX_CART_LINES) {
      break;
    }
  }

  return entries;
}

export function readCartEntries(): CartEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    return normalizeCartEntries(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function writeCartEntries(entries: CartEntry[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage indisponível ou cheio: o carrinho continua em memória.
  }
}

/** Monta a mensagem do WhatsApp com nome, quantidade, unitário, subtotal e total. */
export function buildOrderMessage(lines: CartLine[], total: number): string {
  const header = "Olá! Gostaria de fazer um pedido na Rafinha Tabacaria:";

  const items = lines.map((line, index) => {
    const unitPrice = formatPrice(line.price);
    const subtotal = formatPrice(line.subtotal);

    return `${index + 1}. ${line.name}\n   ${line.quantity}x ${unitPrice} = ${subtotal}`;
  });

  return [header, "", ...items, "", `Total: ${formatPrice(total)}`].join("\n");
}
