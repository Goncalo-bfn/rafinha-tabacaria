import logo from "../assets/logo-dark.png";
import { getWhatsAppUrl, instagramUrl, store } from "../config/store";
import { InstagramIcon } from "./InstagramIcon";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function Footer() {
  return (
    <footer className="border-t border-ink-border bg-ink text-ink-muted">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-10 text-center md:flex-row md:justify-between md:text-left">
        <img
          alt={store.name}
          className="h-20 w-auto rounded-sm bg-background p-2"
          loading="lazy"
          src={logo}
        />
        <div className="flex gap-4">
          <a
            aria-label="WhatsApp"
            className="grid h-11 w-11 place-items-center rounded-full border border-ink-border transition-colors hover:border-accent hover:text-ink-foreground"
            href={getWhatsAppUrl()}
            rel="noopener noreferrer"
            target="_blank"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>
          <a
            aria-label="Instagram"
            className="grid h-11 w-11 place-items-center rounded-full border border-ink-border transition-colors hover:text-ink-foreground"
            href={instagramUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>
        </div>
        <div className="text-xs leading-relaxed">
          <p>Venda proibida para menores de 18 anos.</p>
          <p>O Ministério da Saúde adverte: fumar causa câncer e outras doenças.</p>
          <p className="mt-1">
            © {new Date().getFullYear()} {store.name}. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
