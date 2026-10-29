import { useState } from "react";
import logo from "../assets/logo-dark.png";
import { getWhatsAppUrl, store } from "../config/store";
import { WhatsAppIcon } from "./WhatsAppIcon";

const navigation = [
  { label: "Vitrine", href: "#vitrine" },
  { label: "Sobre", href: "#sobre" },
  { label: "Contato", href: "#contato" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <a
          aria-label={`${store.name} — início`}
          className="flex min-w-0 items-center gap-3"
          href="#inicio"
          onClick={closeMenu}
        >
          <img alt="" className="h-11 w-auto shrink-0" height="677" src={logo} width="512" />
          <span className="truncate font-display text-xl uppercase tracking-wide">
            Rafinha
          </span>
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <a
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
          <a
            className="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-sm bg-accent px-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={getWhatsAppUrl()}
            rel="noopener noreferrer"
            target="_blank"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Contato
          </a>
        </nav>

        <button
          aria-controls="mobile-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          className="grid h-11 w-11 place-items-center md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <span aria-hidden="true" className="relative block h-3 w-6">
            <span className="absolute left-0 top-0 h-0.5 w-6 bg-foreground transition-all" />
            <span className="absolute left-0 top-3 h-0.5 w-6 bg-foreground transition-all" />
          </span>
        </button>

        <nav
          aria-label="Principal para celular"
          className="mobile-nav"
          data-open={menuOpen}
          id="mobile-navigation"
        >
          {navigation.map((item) => (
            <a href={item.href} key={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
          <a href="#contato" onClick={closeMenu}>
            Contato
          </a>
        </nav>
      </div>
    </header>
  );
}
