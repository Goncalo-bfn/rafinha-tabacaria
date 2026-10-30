import { useEffect, useRef } from "react";
import logo from "../assets/logo-dark.png";
import { useCart } from "../context/CartContext";
import { MAX_CART_QUANTITY } from "../lib/cart";
import { formatPrice } from "../lib/format";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function CartDrawer() {
  const {
    checkingPrices,
    clearCart,
    closeCart,
    decrement,
    increment,
    isOpen,
    lines,
    productsStatus,
    removeItem,
    totalPrice,
    whatsappUrl,
  } = useCart();

  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeCart();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const container = drawerRef.current;

      if (!container) {
        return;
      }

      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusables.length === 0) {
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [closeCart, isOpen]);

  if (!isOpen) {
    return null;
  }

  const productsReady = productsStatus === "ready";
  const pricesConfirmed = productsReady && !checkingPrices;
  const canCheckout = pricesConfirmed && lines.length > 0;
  const priceNote = checkingPrices
    ? "Atualizando preços…"
    : "Finalização indisponível até os preços serem confirmados.";

  return (
    <>
      <div
        aria-hidden="true"
        className="cart-overlay"
        onClick={closeCart}
      />
      <aside
        aria-labelledby="cart-title"
        aria-modal="true"
        className="cart-drawer"
        ref={drawerRef}
        role="dialog"
      >
        <header className="cart-drawer__header">
          <div>
            <p className="cart-drawer__eyebrow">Seu pedido</p>
            <h2 className="cart-drawer__title" id="cart-title">
              Carrinho
            </h2>
          </div>
          <button
            aria-label="Fechar carrinho"
            className="cart-drawer__close"
            onClick={closeCart}
            ref={closeButtonRef}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="cart-drawer__body">
          {productsStatus === "loading" && lines.length === 0 ? (
            <p className="cart-state" role="status">
              Carregando os preços atuais…
            </p>
          ) : null}

          {productsStatus === "error" ? (
            <div className="cart-state cart-state--error" role="alert">
              <p className="cart-state__title">
                Não foi possível confirmar os preços atuais.
              </p>
              <p>
                A finalização fica indisponível até a vitrine carregar
                novamente. Feche o carrinho e use “Tentar novamente” na vitrine.
              </p>
            </div>
          ) : null}

          {productsReady && !checkingPrices && lines.length === 0 ? (
            <div className="cart-state">
              <p className="cart-state__title">Seu carrinho está vazio.</p>
              <p>Adicione produtos da vitrine para montar seu pedido.</p>
            </div>
          ) : null}

          {lines.length > 0 ? (
            <ul className="cart-lines">
              {lines.map((line) => (
                <li className="cart-line" key={line.id}>
                  <div className="cart-line__media">
                    {line.imageUrl ? (
                      <img
                        alt=""
                        className="cart-line__image"
                        loading="lazy"
                        src={line.imageUrl}
                      />
                    ) : (
                      <img
                        alt=""
                        className="cart-line__placeholder"
                        loading="lazy"
                        src={logo}
                      />
                    )}
                  </div>

                  <div className="cart-line__body">
                    <p className="cart-line__name">{line.name}</p>
                    <p className="cart-line__unit">
                      {formatPrice(line.price)} cada
                    </p>

                    <div className="cart-line__row">
                      <div className="cart-stepper">
                        <button
                          aria-label={`Diminuir quantidade de ${line.name}`}
                          className="cart-stepper__button"
                          disabled={line.quantity <= 1}
                          onClick={() => decrement(line.id)}
                          type="button"
                        >
                          <span aria-hidden="true">−</span>
                        </button>
                        <span
                          aria-live="polite"
                          className="cart-stepper__value"
                        >
                          {line.quantity}
                        </span>
                        <button
                          aria-label={`Aumentar quantidade de ${line.name}`}
                          className="cart-stepper__button"
                          disabled={line.quantity >= MAX_CART_QUANTITY}
                          onClick={() => increment(line.id)}
                          type="button"
                        >
                          <span aria-hidden="true">+</span>
                        </button>
                      </div>

                      <p className="cart-line__subtotal">
                        {formatPrice(line.subtotal)}
                      </p>
                    </div>

                    <button
                      className="cart-line__remove"
                      onClick={() => removeItem(line.id)}
                      type="button"
                    >
                      Remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <footer className="cart-drawer__footer">
          <div className="cart-total">
            <span>Total</span>
            <strong>{pricesConfirmed ? formatPrice(totalPrice) : "—"}</strong>
          </div>

          {canCheckout ? (
            <a
              className="cart-checkout"
              href={whatsappUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Finalizar no WhatsApp
            </a>
          ) : (
            <button className="cart-checkout" disabled type="button">
              <WhatsAppIcon className="h-5 w-5" />
              Finalizar no WhatsApp
            </button>
          )}

          {canCheckout ? (
            <button
              className="cart-clear"
              onClick={clearCart}
              type="button"
            >
              Limpar carrinho
            </button>
          ) : null}

          {pricesConfirmed ? null : (
            <p className="cart-note">{priceNote}</p>
          )}
        </footer>
      </aside>
    </>
  );
}
