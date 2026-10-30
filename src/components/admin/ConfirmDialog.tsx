import { useEffect } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  busy = false,
  confirmLabel = "Confirmar",
  description,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [busy, onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="admin-overlay">
      <div
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className="admin-modal admin-modal--sm"
        role="dialog"
      >
        <h2 className="admin-modal__title" id="confirm-dialog-title">
          {title}
        </h2>
        <p className="admin-modal__text">{description}</p>
        <div className="admin-modal__actions">
          <button
            className="admin-btn admin-btn--ghost"
            disabled={busy}
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="admin-btn admin-btn--danger"
            disabled={busy}
            onClick={onConfirm}
            type="button"
          >
            {busy ? "Excluindo…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
