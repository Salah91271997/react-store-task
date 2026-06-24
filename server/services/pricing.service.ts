import type { Product } from '../../src/lib/schema';
import { bundle } from '../data';

export function getBundle() {
  return bundle;
}

export function getProduct(id: string): Product | undefined {
  return bundle.products.find((p) => p.id === id);
}

const variantIndex = new Map(
  bundle.products.flatMap((p) =>
    p.variants.map((v) => [v.id, { price: v.price, compareAt: v.compareAt ?? v.price }] as const)
  )
);

export interface QuoteItem {
  variantId: string;
  qty: number;
}

export interface Quote {
  activeTotal: number;
  compareTotal: number;
  savings: number;
}

export function calculateQuote(items: QuoteItem[]): Quote {
  let activeTotal = 0;
  let compareTotal = 0;
  for (const { variantId, qty } of items) {
    const pricing = variantIndex.get(variantId);
    if (!pricing || qty <= 0) continue;
    activeTotal += pricing.price * qty;
    compareTotal += pricing.compareAt * qty;
  }
  const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
  return {
    activeTotal: round(activeTotal),
    compareTotal: round(compareTotal),
    savings: round(compareTotal - activeTotal),
  };
}
