import { store } from "../config/store";

export function About() {
  return (
    <section
      aria-labelledby="about-title"
      className="scroll-mt-16 border-t border-ink-border bg-ink text-ink-foreground"
      id="sobre"
    >
      <div className="mx-auto max-w-4xl px-5 py-20 md:py-28">
        <div>
          <div className="mb-12">
            <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-ink-muted">
              <span aria-hidden="true" className="h-px w-8 bg-accent" />
              A marca
            </p>
            <h2
              className="font-display text-5xl uppercase leading-none text-ink-foreground sm:text-6xl"
              id="about-title"
            >
              Sobre a loja
            </h2>
          </div>
          <p className="text-lg font-light leading-relaxed text-ink-muted">
            A {store.name} reúne produtos selecionados com um olhar clássico e
            atendimento próximo. Confira as novidades no Instagram e tire suas
            dúvidas diretamente pelo WhatsApp.
          </p>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em]">
            @{store.instagramHandle}
          </p>
        </div>
      </div>
    </section>
  );
}
