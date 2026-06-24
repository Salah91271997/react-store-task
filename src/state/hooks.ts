import { useContext, useMemo, useRef, useSyncExternalStore } from 'react';
import type { Bundle, Category, Product } from '@/lib/schema';
import { StoreContext } from './contexts';
import type { BundleStore } from './store';
import {
  selectProductTotalQty,
  selectReviewGroups,
  selectStepSelectionCount,
  selectTotals,
  selectVariantQty,
} from './selectors';
import type { BundleAction, BundleState, ReviewGroup, Totals } from './types';

function useStoreApi(): BundleStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error('state hooks must be used within <BundleProvider>');
  return store;
}

function useStore<T>(
  selector: (state: BundleState) => T,
  isEqual: (a: T, b: T) => boolean = Object.is
): T {
  const store = useStoreApi();
  const cache = useRef<{ value: T } | null>(null);

  const getSnapshot = () => {
    const next = selector(store.getState());
    if (cache.current && isEqual(cache.current.value, next)) {
      return cache.current.value;
    }
    cache.current = { value: next };
    return next;
  };

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

export function useBundleDispatch(): (action: BundleAction) => void {
  return useStoreApi().dispatch;
}

export function useBundleData(): Bundle {
  return useStoreApi().bundle;
}

export function useBundleActions(): Pick<BundleStore, 'saveForLater' | 'reset'> {
  const store = useStoreApi();
  return useMemo(() => ({ saveForLater: store.saveForLater, reset: store.reset }), [store]);
}

export function useOpenStepId(): string | null {
  return useStore((s) => s.openStepId);
}

export function useSelectedVariantId(product: Product): string {
  return useStore((s) => s.productsById[product.id]?.selectedVariantId ?? product.variants[0].id);
}

export function useActiveVariant(product: Product): { variantId: string; qty: number } {
  const variantId = useSelectedVariantId(product);
  const qty = useStore((s) => selectVariantQty(s, product.id, variantId));
  return useMemo(() => ({ variantId, qty }), [variantId, qty]);
}

export function useVariantQty(productId: string, variantId: string): number {
  return useStore((s) => selectVariantQty(s, productId, variantId));
}

export function useProductTotalQty(product: Product): number {
  return useStore((s) => selectProductTotalQty(s, product));
}

export function useStepSelectionCount(category: Category): number {
  const bundle = useBundleData();
  return useStore((s) => selectStepSelectionCount(bundle, s, category));
}

export function useReviewGroups(): ReviewGroup[] {
  const bundle = useBundleData();
  const productsById = useStore((s) => s.productsById);
  return useMemo(() => selectReviewGroups(bundle, { productsById }), [bundle, productsById]);
}

export function useBundleTotals(groups: ReviewGroup[]): Totals {
  return useMemo(() => selectTotals(groups), [groups]);
}
