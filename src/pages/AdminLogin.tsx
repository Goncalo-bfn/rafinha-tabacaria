import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo-dark.png";
import { store } from "../config/store";
import { supabase } from "../lib/supabase";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AuthErrorLike = {
  code?: string;
  message: string;
  status?: number;
};

function toLoginErrorMessage(error: AuthErrorLike): string {
  const code = error.code?.toLowerCase() ?? "";
  const message = error.message.toLowerCase();

  if (
    code === "invalid_credentials" ||
    message.includes("invalid login credentials") ||
    message.includes("user not found")
  ) {
    return "E-mail ou senha incorretos.";
  }

  if (
    code === "email_not_confirmed" ||
    message.includes("email not confirmed")
  ) {
    return "E-mail ainda não confirmado. Verifique sua caixa de entrada.";
  }

  if (
    code === "over_request_rate_limit" ||
    code === "too_many_requests" ||
    error.status === 429 ||
    message.includes("too many requests")
  ) {
    return "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.";
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("fetch failed")
  ) {
    return "Não foi possível conectar. Verifique sua conexão e tente novamente.";
  }

  return "Não foi possível entrar. Tente novamente.";
}

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Informe seu e-mail.");
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError("Informe um e-mail válido.");
      return;
    }

    if (!password) {
      setError("Informe sua senha.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (signInError) {
        setError(toLoginErrorMessage(signInError));
      }
      // Em caso de sucesso, o listener de sessão do useAdminSession assume:
      // ele confirma o UUID em public.admins e libera o painel ou o acesso
      // negado. Não é necessário navegar manualmente daqui.
    } catch {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink font-sans text-ink-foreground antialiased">
      <header className="border-b border-ink-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link
            aria-label={`${store.name} — site`}
            className="flex min-w-0 items-center gap-3"
            to="/"
          >
            <img
              alt=""
              className="h-11 w-auto shrink-0"
              height="677"
              src={logo}
              width="512"
            />
            <span className="truncate font-display text-xl uppercase tracking-wide">
              Painel
            </span>
          </Link>
          <Link
            className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink-foreground"
            to="/"
          >
            Voltar ao site
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-20">
        <div className="w-full max-w-sm">
          <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-ink-muted">
            <span aria-hidden="true" className="h-px w-8 bg-accent" />
            Área restrita
          </p>
          <h1
            className="font-display text-5xl uppercase leading-none"
            id="login-title"
          >
            Acesso
          </h1>
          <p className="mt-6 text-sm font-light text-ink-muted">
            Entre com a conta administrativa da {store.name}.
          </p>

          <form
            aria-busy={submitting}
            aria-labelledby="login-title"
            className="mt-8 flex flex-col gap-4"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted"
                htmlFor="admin-email"
              >
                E-mail
              </label>
              <input
                autoCapitalize="none"
                autoComplete="username"
                className="min-h-12 w-full rounded-sm border border-ink-border bg-ink-card px-4 text-sm text-ink-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                disabled={submitting}
                id="admin-email"
                name="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError(null);
                }}
                placeholder="seu@email.com"
                spellCheck={false}
                type="email"
                value={email}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted"
                htmlFor="admin-password"
              >
                Senha
              </label>
              <input
                autoComplete="current-password"
                className="min-h-12 w-full rounded-sm border border-ink-border bg-ink-card px-4 text-sm text-ink-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                disabled={submitting}
                id="admin-password"
                name="password"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                type="password"
                value={password}
              />
            </div>

            {error ? (
              <p className="admin-form__error" role="alert">
                {error}
              </p>
            ) : null}

            <button
              className="inline-flex min-h-12 w-full items-center justify-center rounded-sm bg-accent px-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground transition-all duration-300 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              disabled={submitting}
              style={{ opacity: submitting ? 0.65 : 1 }}
              type="submit"
            >
              {submitting ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-xs text-ink-muted">
            Acesso restrito à conta administrativa cadastrada.
          </p>
        </div>
      </main>
    </div>
  );
}
