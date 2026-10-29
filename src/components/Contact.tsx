import { getWhatsAppUrl, instagramUrl, store } from "../config/store";
import { InstagramIcon } from "./InstagramIcon";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function Contact() {
  return (
    <section
      aria-labelledby="contact-title"
      className="scroll-mt-16 border-t border-ink-border bg-ink text-ink-foreground"
      id="contato"
    >
      <div className="mx-auto max-w-4xl px-5 py-20 text-center md:py-28">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-ink-muted">
          Contato
        </p>
        <h2
          className="font-display text-5xl uppercase leading-none sm:text-7xl"
          id="contact-title"
        >
          Fale com a gente
        </h2>
        <p className="mx-auto mt-6 max-w-md font-light text-ink-muted">
          Atendimento pelos canais oficiais da loja.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-sm bg-accent px-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={getWhatsAppUrl()}
            rel="noopener noreferrer"
            target="_blank"
          >
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp {store.phoneDisplay}
          </a>
          <a
            className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-sm border border-ink-muted px-6 text-xs font-semibold uppercase tracking-[0.2em] text-ink-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink-foreground hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={instagramUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <InstagramIcon className="h-5 w-5" />
            Instagram @{store.instagramHandle}
          </a>
        </div>
      </div>
    </section>
  );
}
