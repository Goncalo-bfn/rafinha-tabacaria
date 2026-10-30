import logo from "../assets/logo-dark.png";
import { store } from "../config/store";

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
