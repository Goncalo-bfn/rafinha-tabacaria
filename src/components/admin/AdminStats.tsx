type AdminStatsProps = {
  total: number;
  active: number;
  inactive: number;
};

export function AdminStats({ active, inactive, total }: AdminStatsProps) {
  const items = [
    { label: "Produtos cadastrados", value: total },
    { label: "Produtos ativos", value: active },
    { label: "Produtos inativos", value: inactive },
  ];

  return (
    <dl className="admin-stats">
      {items.map((item) => (
        <div className="admin-stat" key={item.label}>
          <dt className="admin-stat__label">{item.label}</dt>
          <dd className="admin-stat__value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
