const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatPrice(value: number): string {
  return brlFormatter.format(Number.isFinite(value) ? value : 0);
}
