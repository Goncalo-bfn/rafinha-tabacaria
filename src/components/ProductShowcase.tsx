import { productPlaceholders } from "../data/products";
import { ProductCard } from "./ProductCard";

export function ProductShowcase() {
  return (
    <section
      aria-labelledby="showcase-title"
      className="scroll-mt-16 bg-ink text-ink-foreground"
      id="vitrine"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="mb-12">
          <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-ink-muted">
            <span aria-hidden="true" className="h-px w-8 bg-accent" />
            Produtos
          </p>
          <h2
            className="font-display text-5xl uppercase leading-none text-ink-foreground sm:text-6xl"
            id="showcase-title"
          >
            Vitrine
          </h2>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {productPlaceholders.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      </div>
    </section>
  );
}
