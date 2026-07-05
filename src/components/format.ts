export function formatMoney(valueMinor: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(valueMinor / 100);
}
