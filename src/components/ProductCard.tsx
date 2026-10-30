import { useEffect, useState } from "react";
import logo from "../assets/logo-dark.png";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/format";
import type { Product } from "../types/product";
import { CartIcon } from "./CartIcon";

type ProductCardProps = {
  product: Product;
  /** Marca visualmente os produtos de exemplo do ambiente de desenvolvimento. */
  demo?: boolean;
};

export function ProductCard({ demo = false, product }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const priceLabel = demo ? "[Preço]" : formatPrice(product.price);

  useEffect(() => {
    if (!added) {
      return;
    }

    const timer = window.setTimeout(() => setAdded(false), 1500);

    return () => window.clearTimeout(timer);
  }, [added]);

  function handleAddToCart() {
    addItem(product.id);
    setAdded(true);
  }

  return (
    <li className="group overflow-hidden border border-ink-border bg-ink-card transition-all duration-300 hover:-translate-y-1 hover:border-ink-muted">
      <div className="relative aspect-[4/5] overflow-hidden bg-ink">
        {product.image_url ? (
          <img
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
            src={product.image_url}
          />
        ) : (
          <div className="m-3 flex h-full flex-col items-center justify-center gap-3 border-2 border-dashed border-ink-border text-ink-muted">
            <img
              alt=""
              className="h-20 w-auto rounded-sm bg-background p-1 opacity-40"
              loading="lazy"
              src={logo}
            />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">
              Foto do produto
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        {demo ? (
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-muted">
            Exemplo
          </span>
        ) : null}
        <h3 className="font-display text-2xl uppercase text-ink-foreground">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-ink-muted">{product.description}</p>
        <div className="mt-5">
          <span className="text-lg font-semibold text-ink-foreground">
            {priceLabel}
          </span>
        </div>
        {demo ? null : (
          <>
            <button
              aria-label={
                added
                  ? `${product.name} adicionado ao carrinho`
                  : `Adicionar ${product.name} ao carrinho`
              }
              className="cart-add"
              data-added={added}
              onClick={handleAddToCart}
              type="button"
            >
              <CartIcon className="h-4 w-4" />
              {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
            </button>
            <span aria-live="polite" className="sr-only">
              {added ? `${product.name} adicionado ao carrinho.` : ""}
            </span>
          </>
        )}
      </div>
    </li>
  );
}
