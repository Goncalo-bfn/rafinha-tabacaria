import logo from "../assets/logo-dark.png";
import { getWhatsAppUrl } from "../config/store";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-background text-foreground"
      id="inicio"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1.1fr_1fr] md:py-28">
        <div className="animate-rise">
          <p className="mb-6 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            <span aria-hidden="true" className="h-px w-10 bg-accent" />
            Loja oficial
          </p>
          <h1
            className="font-display text-7xl uppercase leading-[0.9] sm:text-8xl lg:text-9xl"
            id="hero-title"
          >
            Rafinha
          </h1>
          <p className="mt-3 text-sm font-light uppercase tracking-mega text-muted-foreground sm:text-base">
            Tabacaria
          </p>
          <p className="mt-8 max-w-md text-lg font-light leading-relaxed text-muted-foreground">
            Estilo, tradição e atendimento direto. Escolha na vitrine e fale com
            a gente.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-sm bg-primary px-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href="#vitrine"
            >
              Conhecer a loja
            </a>
            <a
              className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-sm bg-accent px-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={getWhatsAppUrl()}
              rel="noopener noreferrer"
              target="_blank"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Falar no WhatsApp
            </a>
          </div>
        </div>
        <div className="animate-rise mx-auto w-full max-w-sm [animation-delay:200ms] md:max-w-md">
          <img
            alt="Logotipo Rafinha Tabacaria"
            className="h-auto w-full"
            fetchPriority="high"
            height="663"
            src={logo}
            width="512"
          />
        </div>
      </div>
    </section>
  );
}
