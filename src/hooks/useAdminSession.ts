import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type AdminSessionStatus =
  | "loading"
  | "anonymous"
  | "unauthorized"
  | "error"
  | "authorized";

type UseAdminSessionResult = {
  status: AdminSessionStatus;
  user: User | null;
  error: string | null;
  retry: () => void;
  signOut: () => Promise<void>;
};

const SESSION_ERROR =
  "Não foi possível verificar sua sessão. Verifique sua conexão e tente novamente.";

const AUTHORIZATION_ERROR =
  "Não foi possível confirmar seu acesso de administrador. Verifique sua conexão e tente novamente.";

/**
 * Lê a sessão do Supabase Auth e confirma em `public.admins` se o usuário é
 * administrador. A tabela só devolve a própria linha (política
 * `admins_select_self`), portanto a checagem não revela outros admins.
 *
 * Falhas de sessão ou de consulta entram no estado `error` (fail-closed) e
 * podem ser repetidas por `retry`. Nenhum estado de erro libera o painel.
 */
export function useAdminSession(): UseAdminSessionResult {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [status, setStatus] = useState<AdminSessionStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionAttempt, setSessionAttempt] = useState(0);
  const [authorizationAttempt, setAuthorizationAttempt] = useState(0);

  // Mantém a sessão sincronizada com login/logout e renovações de token.
  // O estado inicial é lido por getSession no efeito seguinte.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "INITIAL_SESSION") {
        return;
      }

      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;

    setStatus("loading");
    setError(null);

    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) {
          return;
        }

        if (sessionError) {
          setUser(null);
          setError(SESSION_ERROR);
          setStatus("error");
          return;
        }

        setSession(data.session);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setUser(null);
        setError(SESSION_ERROR);
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [sessionAttempt]);

  useEffect(() => {
    if (session === undefined) {
      return;
    }

    if (!session) {
      setUser(null);
      setError(null);
      setStatus("anonymous");
      return;
    }

    let cancelled = false;
    const currentSession = session;

    setUser(currentSession.user);
    setError(null);
    setStatus("loading");

    async function checkAuthorization() {
      try {
        const { data, error: authorizationError } = await supabase
          .from("admins")
          .select("user_id")
          .eq("user_id", currentSession.user.id)
          .maybeSingle();

        if (cancelled) {
          return;
        }

        if (authorizationError) {
          setError(AUTHORIZATION_ERROR);
          setStatus("error");
          return;
        }

        setStatus(data ? "authorized" : "unauthorized");
      } catch {
        if (cancelled) {
          return;
        }

        setError(AUTHORIZATION_ERROR);
        setStatus("error");
      }
    }

    void checkAuthorization();

    return () => {
      cancelled = true;
    };
  }, [authorizationAttempt, session]);

  const retry = useCallback(() => {
    setError(null);
    setStatus("loading");

    if (session === undefined) {
      setSessionAttempt((current) => current + 1);
    } else {
      setAuthorizationAttempt((current) => current + 1);
    }
  }, [session]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { error, retry, signOut, status, user };
}
