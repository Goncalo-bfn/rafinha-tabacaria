import logo from "../assets/logo-dark.png";
import { store } from "../config/store";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-background text-foreground"
      id="inicio"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center px-5 py-20 text-center md:py-28">
        <h1 className="sr-only" id="hero-title">
          {store.name}
        </h1>

        <p className="animate-rise mb-6 flex items-center justify-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          <span aria-hidden="true" className="h-px w-8 bg-accent" />
          Loja oficial
          <span aria-hidden="true" className="h-px w-8 bg-accent" />
        </p>

        <div className="animate-rise mx-auto w-full max-w-sm [animation-delay:200ms] md:max-w-md">
          <img
            alt={`Logotipo ${store.name}`}
            className="h-auto w-full"
            fetchPriority="high"
            height="663"
            src={logo}
            width="512"
          />
        </div>

        <p className="mt-8 max-w-md text-lg font-light leading-relaxed text-muted-foreground">
          Estilo, tradição e atendimento direto. Escolha na vitrine e fale com
          a gente.
        </p>
      </div>
    </section>
  );
}
