import { createClient } from "@supabase/supabase-js";

type EnvVarName = "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY";

function readEnv(name: EnvVarName, value: unknown): string {
  const parsed = typeof value === "string" ? value.trim() : "";

  if (!parsed) {
    throw new Error(
      `[Supabase] Variável de ambiente ${name} não configurada. ` +
        `Copie .env.example para .env.local e preencha ${name} com o valor ` +
        `disponível no painel do Supabase (Project Settings > API).`,
    );
  }

  return parsed;
}

const supabaseUrl = readEnv("VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = readEnv(
  "VITE_SUPABASE_ANON_KEY",
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

if (!/^https?:\/\//i.test(supabaseUrl)) {
  throw new Error(
    "[Supabase] VITE_SUPABASE_URL inválida: use a URL completa do projeto, " +
      "no formato https://<project-ref>.supabase.co.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
