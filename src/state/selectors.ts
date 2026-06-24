import type { Bundle, Category, Product } from '@/lib/schema';
import type { BundleState, ReviewGroup, ReviewLine, Totals } from './types';

type StateSlice = Pick<BundleState, 'productsById'>;

export function selectVariantQty(state: StateSlice, productId: string, variantId: string): number {
  return state.productsById[productId]?.quantities[variantId] ?? 0;
}

export function selectSelectedVariantId(state: StateSlice, productId: string): string | undefined {
  return state.productsById[productId]?.selectedVariantId;
}

export function selectProductTotalQty(state: StateSlice, product: Product): number {
  const ps = state.productsById[product.id];
  if (!ps) return 0;
  return product.variants.reduce((sum, v) => sum + (ps.quantities[v.id] ?? 0), 0);
}

export function selectStepSelectionCount(
  bundle: Bundle,
  state: StateSlice,
  category: Category
): number {
  return bundle.products.filter(
    (p) => p.category === category && selectProductTotalQty(state, p) > 0
  ).length;
}

export function selectReviewGroups(bundle: Bundle, state: StateSlice): ReviewGroup[] {
  const groups: ReviewGroup[] = [];

  for (const category of bundle.reviewGroupOrder) {
    const lines: ReviewLine[] = [];
    for (const product of bundle.products) {
      if (product.category !== category) continue;
      const activeVariants = product.variants.filter(
        (v) => selectVariantQty(state, product.id, v.id) > 0
      );
      const showVariant = activeVariants.length > 1;
      for (const variant of activeVariants) {
        const qty = selectVariantQty(state, product.id, variant.id);
        const unitCompare = variant.compareAt ?? variant.price;
        lines.push({
          key: variant.id,
          product,
          variant,
          qty,
          lineActive: variant.price * qty,
          lineCompare: unitCompare * qty,
          showVariant,
        });
      }
    }
    if (lines.length > 0) {
      groups.push({ category, label: bundle.groupLabels[category] ?? category, lines });
    }
  }

  return groups;
}

export function selectTotals(groups: ReviewGroup[]): Totals {
  let activeTotal = 0;
  let compareTotal = 0;
  for (const group of groups) {
    for (const line of group.lines) {
      activeTotal += line.lineActive;
      compareTotal += line.lineCompare;
    }
  }
  return {
    activeTotal: round2(activeTotal),
    compareTotal: round2(compareTotal),
    savings: round2(compareTotal - activeTotal),
  };
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
