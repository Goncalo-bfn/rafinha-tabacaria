import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getWhatsAppUrl } from "../config/store";
import type { ProductsStatus } from "../hooks/useProducts";
import {
  CART_STORAGE_KEY,
  MAX_CART_LINES,
  buildOrderMessage,
  clampQuantity,
  readCartEntries,
  writeCartEntries,
  type CartEntry,
  type CartLine,
} from "../lib/cart";
import type { Product } from "../types/product";

type CartContextValue = {
  /** Linhas válidas, com preço e nome vindos do catálogo atual. */
  lines: CartLine[];
  /** Soma das quantidades persistidas (badge do cabeçalho). */
  totalQuantity: number;
  /** Total calculado apenas com os preços atuais do Supabase. */
  totalPrice: number;
  /** Estado do catálogo; a finalização só é liberada em "ready". */
  productsStatus: ProductsStatus;
  /** true enquanto o catálogo é reconsultado ao abrir o carrinho. */
  checkingPrices: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  whatsappUrl: string;
};

type CartProviderProps = {
  products: Product[];
  productsStatus: ProductsStatus;
  /** Reconsulta o catálogo no Supabase (usado ao abrir o carrinho). */
  reloadProducts: () => void;
  children: ReactNode;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  products,
  productsStatus,
  reloadProducts,
}: CartProviderProps) {
  const [entries, setEntries] = useState<CartEntry[]>(() => readCartEntries());
  const [isOpen, setIsOpen] = useState(false);
  const [checkingPrices, setCheckingPrices] = useState(false);
  const refreshPendingRef = useRef(false);

  const productsById = useMemo(() => {
    const map = new Map<string, Product>();

    for (const product of products) {
      map.set(product.id, product);
    }

    return map;
  }, [products]);

  const productsReady = productsStatus === "ready";

  // Produtos desativados/excluídos deixam de vir do Supabase. Quando o
  // catálogo carrega com sucesso, os ids órfãos são removidos do carrinho.
  useEffect(() => {
    if (!productsReady) {
      return;
    }

    setEntries((current) => {
      const next = current.filter((entry) => {
        const product = productsById.get(entry.id);

        return Boolean(product?.active);
      });

      return next.length === current.length ? current : next;
    });
  }, [productsById, productsReady]);

  // Enquanto o catálogo é reconsultado, o checkout fica bloqueado mesmo que o
  // status ainda não tenha virado "loading" no mesmo frame.
  useEffect(() => {
    if (productsStatus === "loading") {
      refreshPendingRef.current = true;
      return;
    }

    if (refreshPendingRef.current) {
      refreshPendingRef.current = false;
      setCheckingPrices(false);
    }
  }, [productsStatus]);

  useEffect(() => {
    writeCartEntries(entries);
  }, [entries]);

  // Mantém o carrinho coerente entre abas abertas.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== CART_STORAGE_KEY) {
        return;
      }

      setEntries(readCartEntries());
    }

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const lines = useMemo<CartLine[]>(() => {
    const result: CartLine[] = [];

    for (const entry of entries) {
      const product = productsById.get(entry.id);

      if (!product || !product.active) {
        continue;
      }

      const price = Number(product.price);
      const safePrice = Number.isFinite(price) ? price : 0;

      result.push({
        id: product.id,
        imageUrl: product.image_url,
        name: product.name,
        price: safePrice,
        quantity: entry.quantity,
        subtotal: safePrice * entry.quantity,
      });
    }

    return result;
  }, [entries, productsById]);

  const totalQuantity = useMemo(
    () => entries.reduce((sum, entry) => sum + entry.quantity, 0),
    [entries],
  );

  const totalPrice = useMemo(
    () => lines.reduce((sum, line) => sum + line.subtotal, 0),
    [lines],
  );

  const addItem = useCallback(
    (productId: string) => {
      if (!productsById.has(productId)) {
        return;
      }

      setEntries((current) => {
        const existing = current.find((entry) => entry.id === productId);

        if (existing) {
          return current.map((entry) =>
            entry.id === productId
              ? { ...entry, quantity: clampQuantity(entry.quantity + 1) }
              : entry,
          );
        }

        if (current.length >= MAX_CART_LINES) {
          return current;
        }

        return [...current, { id: productId, quantity: 1 }];
      });
    },
    [productsById],
  );

  const changeQuantity = useCallback((productId: string, delta: number) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.id === productId
          ? { ...entry, quantity: clampQuantity(entry.quantity + delta) }
          : entry,
      ),
    );
  }, []);

  const increment = useCallback(
    (productId: string) => changeQuantity(productId, 1),
    [changeQuantity],
  );

  const decrement = useCallback(
    (productId: string) => changeQuantity(productId, -1),
    [changeQuantity],
  );

  const removeItem = useCallback((productId: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setEntries([]);
  }, []);

  const openCart = useCallback(() => {
    setIsOpen(true);

    // Reconfirma preços e disponibilidade antes de exibir/finalizar o pedido.
    // Durante a consulta o status vira "loading" e a finalização fica bloqueada.
    if (entries.length > 0 && productsStatus !== "loading") {
      setCheckingPrices(true);
      reloadProducts();
    }
  }, [entries.length, productsStatus, reloadProducts]);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  const whatsappUrl = useMemo(() => {
    if (lines.length === 0) {
      return getWhatsAppUrl();
    }

    return getWhatsAppUrl(buildOrderMessage(lines, totalPrice));
  }, [lines, totalPrice]);

  const value = useMemo<CartContextValue>(
    () => ({
      addItem,
      checkingPrices,
      clearCart,
      closeCart,
      decrement,
      increment,
      isOpen,
      lines,
      openCart,
      productsStatus,
      removeItem,
      totalPrice,
      totalQuantity,
      whatsappUrl,
    }),
    [
      addItem,
      checkingPrices,
      clearCart,
      closeCart,
      decrement,
      increment,
      isOpen,
      lines,
      openCart,
      productsStatus,
      removeItem,
      totalPrice,
      totalQuantity,
      whatsappUrl,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart deve ser usado dentro de <CartProvider>.");
  }

  return context;
}
