import { useCallback, useMemo, useState } from "react";
import { AdminHeader } from "../components/admin/AdminHeader";
import { AdminStats } from "../components/admin/AdminStats";
import { ConfirmDialog } from "../components/admin/ConfirmDialog";
import { ProductForm } from "../components/admin/ProductForm";
import { ProductTable } from "../components/admin/ProductTable";
import { Toast, type ToastMessage } from "../components/admin/Toast";
import { useAdminProducts } from "../hooks/useAdminProducts";
import { deleteProduct, updateProductActive } from "../services/products";
import { deleteProductImage } from "../services/storage";
import type { Product } from "../types/product";

type AdminDashboardProps = {
  email?: string;
  onSignOut: () => void;
};

export function AdminDashboard({ email, onSignOut }: AdminDashboardProps) {
  const { error, products, refresh, status } = useAdminProducts();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const stats = useMemo(() => {
    const active = products.filter((product) => product.active).length;

    return {
      active,
      inactive: products.length - active,
      total: products.length,
    };
  }, [products]);

  const showToast = useCallback(
    (kind: ToastMessage["kind"], text: string) => {
      setToast({ id: Date.now(), kind, text });
    },
    [],
  );

  const dismissToast = useCallback(() => setToast(null), []);

  function openCreateForm() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditing(product);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  function handleSaved(message: string) {
    closeForm();
    showToast("success", message);
    refresh();
  }

  async function handleToggleActive(product: Product) {
    setBusyId(product.id);

    try {
      await updateProductActive(product.id, !product.active);
      showToast(
        "success",
        product.active ? "Produto desativado." : "Produto ativado.",
      );
      refresh();
    } catch (cause) {
      showToast(
        "error",
        cause instanceof Error
          ? cause.message
          : "Não foi possível atualizar o produto.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) {
      return;
    }

    setDeleting(true);

    try {
      const hadImage = Boolean(pendingDelete.image_url);

      await deleteProduct(pendingDelete.id);

      // A exclusão do registro já foi concluída. A remoção da imagem é uma
      // etapa separada e nunca deve transformar o sucesso em erro.
      const removed = hadImage
        ? await deleteProductImage(pendingDelete.image_url).catch(() => false)
        : false;

      if (removed) {
        showToast("success", "Produto e imagem excluídos.");
      } else if (hadImage) {
        showToast(
          "success",
          "Produto excluído, mas a imagem não foi removida " +
            "(imagem externa ou falha no Storage).",
        );
      } else {
        showToast("success", "Produto excluído.");
      }

      setPendingDelete(null);
      refresh();
    } catch (cause) {
      showToast(
        "error",
        cause instanceof Error
          ? cause.message
          : "Não foi possível excluir o produto.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="admin-shell">
      <AdminHeader email={email} onSignOut={onSignOut} />

      <main className="admin-container admin-main">
        <section aria-labelledby="admin-summary-title" className="admin-section" id="resumo">
          <div className="admin-section__head">
            <div>
              <p className="admin-eyebrow">Visão geral</p>
              <h1 className="admin-title" id="admin-summary-title">
                Painel
              </h1>
            </div>
            <button
              className="admin-btn admin-btn--primary"
              onClick={openCreateForm}
              type="button"
            >
              Adicionar produto
            </button>
          </div>

          <AdminStats
            active={stats.active}
            inactive={stats.inactive}
            total={stats.total}
          />

          {status === "error" ? (
            <div className="admin-alert admin-alert--error">
              <p>{error}</p>
              <div className="admin-alert__actions">
                <button
                  className="admin-btn admin-btn--sm"
                  onClick={refresh}
                  type="button"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section aria-labelledby="admin-products-title" className="admin-section" id="produtos">
          <div className="admin-section__head">
            <h2 className="admin-subtitle" id="admin-products-title">
              Produtos
            </h2>
            <p className="admin-hint">
              {stats.total} cadastrado{stats.total === 1 ? "" : "s"}
            </p>
          </div>

          {status === "loading" ? (
            <p className="admin-hint">Carregando produtos…</p>
          ) : null}

          {status === "ready" && products.length === 0 ? (
            <div className="admin-empty">
              Nenhum produto cadastrado ainda. Use “Adicionar produto” para
              criar o primeiro.
            </div>
          ) : null}

          {products.length > 0 ? (
            <ProductTable
              busyId={busyId}
              onDelete={setPendingDelete}
              onEdit={openEditForm}
              onToggleActive={handleToggleActive}
              products={products}
            />
          ) : null}
        </section>
      </main>

      <ProductForm
        onClose={closeForm}
        onSaved={handleSaved}
        open={formOpen}
        product={editing}
      />

      <ConfirmDialog
        busy={deleting}
        confirmLabel="Excluir produto"
        description={
          pendingDelete
            ? `Excluir “${pendingDelete.name}”? A imagem do bucket também será removida quando pertencer ao caminho gerenciado. Esta ação não pode ser desfeita.`
            : ""
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        open={Boolean(pendingDelete)}
        title="Confirmar exclusão"
      />

      <Toast message={toast} onDismiss={dismissToast} />
    </div>
  );
}
