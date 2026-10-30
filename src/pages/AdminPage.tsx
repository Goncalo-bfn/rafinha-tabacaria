import { useAdminSession } from "../hooks/useAdminSession";
import { AdminDashboard } from "./AdminDashboard";
import { AdminLogin } from "./AdminLogin";

type AdminGateProps = {
  title: string;
  text: string;
  onRetry?: () => void;
  onSignOut?: () => void;
};

function AdminGate({ onRetry, onSignOut, text, title }: AdminGateProps) {
  return (
    <div className="admin-gate">
      <div className="admin-gate__box">
        <p className="admin-gate__title">{title}</p>
        <p className="admin-gate__text">{text}</p>
        {onRetry || onSignOut ? (
          <div className="admin-gate__actions">
            {onRetry ? (
              <button
                className="admin-btn admin-btn--primary"
                onClick={onRetry}
                type="button"
              >
                Tentar novamente
              </button>
            ) : null}
            {onSignOut ? (
              <button className="admin-btn" onClick={onSignOut} type="button">
                Sair
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AdminPage() {
  const { error, retry, signOut, status, user } = useAdminSession();

  if (status === "loading") {
    return <AdminGate text="Verificando sua sessão…" title="Aguarde" />;
  }

  if (status === "error") {
    return (
      <AdminGate
        onRetry={retry}
        onSignOut={
          user
            ? () => {
                void signOut();
              }
            : undefined
        }
        text={error ?? "Não foi possível verificar seu acesso. Tente novamente."}
        title="Falha de conexão"
      />
    );
  }

  if (status === "anonymous") {
    return <AdminLogin />;
  }

  if (status === "unauthorized") {
    return (
      <AdminGate
        onSignOut={() => {
          void signOut();
        }}
        text="Sua conta está autenticada, mas não consta na lista de administradores da loja."
        title="Acesso negado"
      />
    );
  }

  return (
    <AdminDashboard
      email={user?.email ?? undefined}
      onSignOut={() => {
        void signOut();
      }}
    />
  );
}
