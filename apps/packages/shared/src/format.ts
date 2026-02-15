/**
 * Format currency in Tunisian Dinar (TND)
 * Uses French-Tunisia locale with 3 decimal places
 */
export function formatCurrency(amount: number): string {
  const price = amount
    .toLocaleString("fr-TN", {
      style: "currency",
      currency: "TND",
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    })
    .replace(/\u202F|\u00A0/g, " ");
  return price;
}

/**
 * Format weight with optional unit
 * @param weight - Weight value as number
 * @param unit - Unit suffix (default: "kg")
 */
export function formatWeight(weight: number, unit = "kg"): string {
  return `${weight.toFixed(2)} ${unit}`;
}
