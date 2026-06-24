import type { Bundle, Product } from '@/lib/schema';
import type { BundleAction, BundleState, ProductState } from './types';

export function buildInitialProducts(bundle: Bundle): Record<string, ProductState> {
  const productsById: Record<string, ProductState> = {};
  for (const product of bundle.products) {
    const quantities: Record<string, number> = {};
    for (const variant of product.variants) {
      quantities[variant.id] = variant.seedQty;
    }

    const seeded = product.variants.find((v) => v.seedQty > 0);
    productsById[product.id] = {
      selectedVariantId: (seeded ?? product.variants[0]).id,
      quantities,
    };
  }
  return productsById;
}

export function buildInitialState(bundle: Bundle): BundleState {
  return {
    productsById: buildInitialProducts(bundle),
    openStepId: bundle.steps[0]?.id ?? null,
  };
}

function clampQty(qty: number, product: Product | undefined): number {
  const min = product?.minQty ?? 0;
  return Math.max(min, Math.trunc(qty));
}

export function createBundleReducer(bundle: Bundle) {
  const productById = new Map(bundle.products.map((p) => [p.id, p] as const));

  return function bundleReducer(state: BundleState, action: BundleAction): BundleState {
    switch (action.type) {
      case 'SET_VARIANT_QTY': {
        const product = productById.get(action.productId);
        const next = clampQty(action.qty, product);
        return setQty(state, action.productId, action.variantId, next);
      }
      case 'INCREMENT': {
        const current = state.productsById[action.productId]?.quantities[action.variantId] ?? 0;
        return setQty(state, action.productId, action.variantId, current + 1);
      }
      case 'DECREMENT': {
        const product = productById.get(action.productId);
        const current = state.productsById[action.productId]?.quantities[action.variantId] ?? 0;
        return setQty(state, action.productId, action.variantId, clampQty(current - 1, product));
      }
      case 'TOGGLE_PRODUCT': {
        const product = productById.get(action.productId);
        const ps = state.productsById[action.productId];
        if (!product || !ps) return state;
        const total = product.variants.reduce((sum, v) => sum + (ps.quantities[v.id] ?? 0), 0);
        if (total > 0) {
          if (product.required) return state;
          const cleared: Record<string, number> = {};
          for (const v of product.variants) cleared[v.id] = 0;
          return {
            ...state,
            productsById: { ...state.productsById, [action.productId]: { ...ps, quantities: cleared } },
          };
        }
        return setQty(state, action.productId, ps.selectedVariantId, Math.max(1, product.minQty));
      }
      case 'SELECT_VARIANT': {
        const ps = state.productsById[action.productId];
        if (!ps || ps.selectedVariantId === action.variantId) return state;
        return {
          ...state,
          productsById: {
            ...state.productsById,
            [action.productId]: { ...ps, selectedVariantId: action.variantId },
          },
        };
      }
      case 'OPEN_STEP':
        return state.openStepId === action.stepId ? state : { ...state, openStepId: action.stepId };
      case 'TOGGLE_STEP':
        return {
          ...state,
          openStepId: state.openStepId === action.stepId ? null : action.stepId,
        };
      case 'HYDRATE':
        return { ...state, productsById: action.productsById };
      case 'RESET':
        return buildInitialState(bundle);
      default:
        return state;
    }
  };
}

function setQty(
  state: BundleState,
  productId: string,
  variantId: string,
  qty: number
): BundleState {
  const ps = state.productsById[productId];
  if (!ps) return state;
  if (ps.quantities[variantId] === qty) return state;
  return {
    ...state,
    productsById: {
      ...state.productsById,
      [productId]: {
        ...ps,
        quantities: { ...ps.quantities, [variantId]: qty },
      },
    },
  };
}
