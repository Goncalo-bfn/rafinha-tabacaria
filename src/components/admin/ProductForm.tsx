import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  PRODUCT_IMAGE_ACCEPT,
  deleteProductImage,
  uploadProductImage,
  validateProductImage,
} from "../../services/storage";
import {
  createProduct,
  updateProduct,
} from "../../services/products";
import type { Product, ProductInput } from "../../types/product";

type ProductFormProps = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSaved: (message: string) => void;
};

export function ProductForm({
  onClose,
  onSaved,
  open,
  product,
}: ProductFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [active, setActive] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(product?.name ?? "");
    setDescription(product?.description ?? "");
    setPrice(product ? String(product.price) : "");
    setCategory(product?.category ?? "");
    setSortOrder(product ? String(product.sort_order) : "0");
    setActive(product?.active ?? true);
    setFile(null);
    setObjectUrl(null);
    setFormError(null);
  }, [open, product]);

  useEffect(() => {
    if (!objectUrl) {
      return;
    }

    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open, saving]);

  if (!open) {
    return null;
  }

  const previewSrc = objectUrl ?? product?.image_url ?? null;
  const isEditing = Boolean(product);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;

    setObjectUrl(null);
    setFile(null);

    if (!selected) {
      return;
    }

    const invalid = validateProductImage(selected);

    if (invalid) {
      setFormError(invalid);
      event.target.value = "";
      return;
    }

    setFormError(null);
    setFile(selected);
    setObjectUrl(URL.createObjectURL(selected));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setFormError("Informe o nome do produto.");
      return;
    }

    const numericPrice = Number(price.replace(",", "."));

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setFormError("Informe um preço válido, maior ou igual a zero.");
      return;
    }

    const numericSortOrder = Number(sortOrder || "0");

    if (!Number.isInteger(numericSortOrder)) {
      setFormError("A ordem de exibição deve ser um número inteiro.");
      return;
    }

    setSaving(true);
    setFormError(null);

    // Se o upload der certo mas a gravação no banco falhar, removemos o
    // arquivo recém-enviado para não deixar lixo no bucket.
    let uploadedImageUrl: string | null = null;

    try {
      let imageUrl = product?.image_url ?? null;

      if (file) {
        const uploaded = await uploadProductImage(file);
        imageUrl = uploaded.publicUrl;
        uploadedImageUrl = uploaded.publicUrl;
      }

      const input: ProductInput = {
        active,
        category: category.trim() || null,
        description: description.trim() || null,
        image_url: imageUrl,
        name: trimmedName,
        price: numericPrice,
        sort_order: numericSortOrder,
      };

      if (product) {
        await updateProduct(product.id, input);
      } else {
        await createProduct(input);
      }

      // O novo arquivo já pertence ao produto salvo.
      uploadedImageUrl = null;

      let savedMessage = product
        ? "Produto atualizado com sucesso."
        : "Produto cadastrado com sucesso.";

      if (file && product?.image_url && product.image_url !== imageUrl) {
        // A remoção da imagem antiga é uma etapa separada. Se falhar, o
        // produto continua salvo e o usuário recebe apenas um aviso.
        const removed = await deleteProductImage(product.image_url).catch(
          () => false,
        );

        if (!removed) {
          savedMessage =
            "Produto atualizado, mas a imagem anterior não foi removida " +
            "(imagem externa ou falha no Storage).";
        }
      }

      onSaved(savedMessage);
    } catch (cause) {
      if (uploadedImageUrl && uploadedImageUrl !== product?.image_url) {
        await deleteProductImage(uploadedImageUrl).catch(() => false);
      }

      setFormError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível salvar o produto.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-overlay">
      <div
        aria-labelledby="product-form-title"
        aria-modal="true"
        className="admin-modal"
        role="dialog"
      >
        <h2 className="admin-modal__title" id="product-form-title">
          {isEditing ? "Editar produto" : "Novo produto"}
        </h2>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-field">
            <label className="admin-label" htmlFor="product-name">
              Nome *
            </label>
            <input
              className="admin-input"
              id="product-name"
              maxLength={120}
              onChange={(event) => setName(event.target.value)}
              required
              type="text"
              value={name}
            />
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="product-description">
              Descrição
            </label>
            <textarea
              className="admin-textarea"
              id="product-description"
              maxLength={600}
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </div>

          <div className="admin-form__row">
            <div className="admin-field">
              <label className="admin-label" htmlFor="product-price">
                Preço (R$) *
              </label>
              <input
                className="admin-input"
                id="product-price"
                inputMode="decimal"
                min="0"
                onChange={(event) => setPrice(event.target.value)}
                required
                step="0.01"
                type="number"
                value={price}
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="product-category">
                Categoria
              </label>
              <input
                className="admin-input"
                id="product-category"
                maxLength={60}
                onChange={(event) => setCategory(event.target.value)}
                type="text"
                value={category}
              />
            </div>
          </div>

          <div className="admin-form__row">
            <div className="admin-field">
              <label className="admin-label" htmlFor="product-sort-order">
                Ordem de exibição
              </label>
              <input
                className="admin-input"
                id="product-sort-order"
                onChange={(event) => setSortOrder(event.target.value)}
                step="1"
                type="number"
                value={sortOrder}
              />
            </div>

            <div className="admin-field">
              <span className="admin-label">Status</span>
              <label className="admin-checkbox" htmlFor="product-active">
                <input
                  checked={active}
                  id="product-active"
                  onChange={(event) => setActive(event.target.checked)}
                  type="checkbox"
                />
                Produto ativo na vitrine
              </label>
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="product-image">
              Imagem (JPEG, PNG ou WebP — até 5 MB)
            </label>
            <input
              accept={PRODUCT_IMAGE_ACCEPT}
              className="admin-input"
              id="product-image"
              onChange={handleFileChange}
              type="file"
            />
            <div className="admin-preview">
              {previewSrc ? (
                <img
                  alt="Prévia da imagem do produto"
                  className="admin-preview__img"
                  src={previewSrc}
                />
              ) : (
                <span className="admin-hint">Nenhuma imagem selecionada.</span>
              )}
            </div>
          </div>

          {formError ? (
            <p className="admin-form__error" role="alert">
              {formError}
            </p>
          ) : null}

          <div className="admin-modal__actions">
            <button
              className="admin-btn admin-btn--ghost"
              disabled={saving}
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="admin-btn admin-btn--primary"
              disabled={saving}
              type="submit"
            >
              {saving
                ? "Salvando…"
                : isEditing
                  ? "Salvar alterações"
                  : "Cadastrar produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
