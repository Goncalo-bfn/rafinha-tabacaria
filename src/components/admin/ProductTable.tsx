import { formatPrice } from "../../lib/format";
import type { Product } from "../../types/product";

type ProductTableProps = {
  products: Product[];
  busyId: string | null;
  onEdit: (product: Product) => void;
  onToggleActive: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductTable({
  busyId,
  onDelete,
  onEdit,
  onToggleActive,
  products,
}: ProductTableProps) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">Produto</th>
            <th scope="col">Preço</th>
            <th scope="col">Status</th>
            <th scope="col">Ordem</th>
            <th scope="col">Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div className="admin-product">
                  {product.image_url ? (
                    <img
                      alt=""
                      className="admin-product__thumb"
                      loading="lazy"
                      src={product.image_url}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="admin-product__thumb admin-product__thumb--empty"
                    />
                  )}
                  <div>
                    <p className="admin-product__name">{product.name}</p>
                    <p className="admin-product__meta">
                      {product.category ?? "Sem categoria"}
                    </p>
                  </div>
                </div>
              </td>
              <td>{formatPrice(product.price)}</td>
              <td>
                <span
                  className={
                    product.active
                      ? "admin-badge admin-badge--on"
                      : "admin-badge admin-badge--off"
                  }
                >
                  {product.active ? "Ativo" : "Inativo"}
                </span>
              </td>
              <td>{product.sort_order}</td>
              <td>
                <div className="admin-actions">
                  <button
                    className="admin-btn admin-btn--sm"
                    onClick={() => onEdit(product)}
                    type="button"
                  >
                    Editar
                  </button>
                  <button
                    className="admin-btn admin-btn--sm"
                    disabled={busyId === product.id}
                    onClick={() => onToggleActive(product)}
                    type="button"
                  >
                    {product.active ? "Desativar" : "Ativar"}
                  </button>
                  <button
                    className="admin-btn admin-btn--sm admin-btn--danger"
                    disabled={busyId === product.id}
                    onClick={() => onDelete(product)}
                    type="button"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
