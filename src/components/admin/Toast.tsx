import { useEffect } from "react";

export type ToastMessage = {
  id: number;
  kind: "success" | "error";
  text: string;
};

type ToastProps = {
  message: ToastMessage | null;
  onDismiss: () => void;
};

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(onDismiss, 5000);

    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className={`admin-toast admin-toast--${message.kind}`}
      role="status"
    >
      <span>{message.text}</span>
      <button
        aria-label="Fechar mensagem"
        className="admin-toast__close"
        onClick={onDismiss}
        type="button"
      >
        ×
      </button>
    </div>
  );
}
