import type { Category, Product, Variant } from '@/lib/schema';

export type QuantitiesByVariant = Record<string, number>;

export interface ProductState {
  selectedVariantId: string;

  quantities: QuantitiesByVariant;
}

export interface BundleState {
  productsById: Record<string, ProductState>;

  openStepId: string | null;
}

export interface PersistedState {
  version: number;
  productsById: Record<string, ProductState>;
}

export type BundleAction =
  | { type: 'SET_VARIANT_QTY'; productId: string; variantId: string; qty: number }
  | { type: 'INCREMENT'; productId: string; variantId: string }
  | { type: 'DECREMENT'; productId: string; variantId: string }
  | { type: 'SELECT_VARIANT'; productId: string; variantId: string }
  | { type: 'TOGGLE_PRODUCT'; productId: string }
  | { type: 'OPEN_STEP'; stepId: string }
  | { type: 'TOGGLE_STEP'; stepId: string }
  | { type: 'HYDRATE'; productsById: Record<string, ProductState> }
  | { type: 'RESET' };

export interface ReviewLine {
  key: string;
  product: Product;
  variant: Variant;
  qty: number;
  lineActive: number;
  lineCompare: number;
  showVariant: boolean;
}

export interface ReviewGroup {
  category: Category;
  label: string;
  lines: ReviewLine[];
}

export interface Totals {
  activeTotal: number;
  compareTotal: number;
  savings: number;
}
