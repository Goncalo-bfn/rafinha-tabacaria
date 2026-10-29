import logo from "../assets/logo-dark.png";
import { getWhatsAppUrl } from "../config/store";
import type { ProductPlaceholder } from "../data/products";
import { WhatsAppIcon } from "./WhatsAppIcon";

type ProductCardProps = {
  product: ProductPlaceholder;
};

export function ProductCard({ product }: ProductCardProps) {
  const inquiry = `Olá! Tenho interesse em: ${product.name}`;

  return (
    <li className="group overflow-hidden border border-ink-border bg-ink-card transition-all duration-300 hover:-translate-y-1 hover:border-ink-muted">
      <div className="relative aspect-[4/5] overflow-hidden bg-ink">
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
      </div>
      <div className="p-5">
        <h3 className="font-display text-2xl uppercase text-ink-foreground">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-ink-muted">{product.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-lg font-semibold text-ink-foreground">
            {product.price}
          </span>
          <a
            aria-label={`Consultar ${product.name} no WhatsApp`}
            className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-accent px-4 text-xs font-semibold uppercase tracking-[0.15em] text-accent-foreground transition hover:brightness-110"
            href={getWhatsAppUrl(inquiry)}
            rel="noopener noreferrer"
            target="_blank"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Consultar
          </a>
        </div>
      </div>
    </li>
  );
}
