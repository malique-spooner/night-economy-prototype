import type { MarketProduct } from "../../engine/types";
import { categoryLabel, groupProductsByCategory } from "../tv/tvHelpers";

export function portalCategories(products: MarketProduct[]) {
  return groupProductsByCategory(products).map(([category]) => category);
}

export function portalCategoryOptions(products: MarketProduct[], currentCategory: string) {
  return [...new Set([...portalCategories(products), currentCategory].filter(Boolean))];
}

export function portalCategoryLabel(category: string) {
  return categoryLabel(category);
}

export function formatInputMoney(valueMinor: number) {
  return (valueMinor / 100).toFixed(2);
}
