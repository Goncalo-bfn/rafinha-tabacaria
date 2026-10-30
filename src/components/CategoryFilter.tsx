import type { ProductCategory } from "../lib/categories";

type CategoryFilterProps = {
  categories: ProductCategory[];
  /** Quantidade total de produtos exibidos na opção "Todas". */
  totalCount: number;
  /** `null` representa a opção "Todas". */
  selected: string | null;
  onSelect: (category: string | null) => void;
};

export function CategoryFilter({
  categories,
  onSelect,
  selected,
  totalCount,
}: CategoryFilterProps) {
  const visibleCount =
    selected === null
      ? totalCount
      : categories.find((category) => category.name === selected)?.count ?? 0;

  const statusText =
    selected === null
      ? `${totalCount} ${totalCount === 1 ? "produto" : "produtos"}`
      : `${visibleCount} de ${totalCount} em ${selected}`;

  return (
    <div className="category-filter">
      <div className="category-filter__head">
        <h3 className="category-filter__title">Categorias</h3>
        <p aria-live="polite" className="category-filter__status" role="status">
          {statusText}
        </p>
      </div>

      <div
        aria-label="Filtrar produtos por categoria"
        className="category-filter__list"
        role="group"
      >
        <button
          aria-pressed={selected === null}
          className="category-chip"
          data-selected={selected === null}
          onClick={() => onSelect(null)}
          type="button"
        >
          <span className="category-chip__name">Todas</span>
          <span className="category-chip__count">{totalCount}</span>
        </button>

        {categories.map((category) => {
          const isSelected = selected === category.name;

          return (
            <button
              aria-pressed={isSelected}
              className="category-chip"
              data-selected={isSelected}
              key={category.name}
              onClick={() => onSelect(category.name)}
              type="button"
            >
              <span className="category-chip__name">{category.name}</span>
              <span className="category-chip__count">{category.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
