import type { Bundle } from '@/lib/schema';
import { buildInitialState, createBundleReducer } from './reducer';
import { clearState, loadPersistedProducts, saveState } from './persistence';
import type { BundleAction, BundleState } from './types';

export interface BundleStore {
  readonly bundle: Bundle;
  getState(): BundleState;
  dispatch(action: BundleAction): void;
  subscribe(listener: () => void): () => void;

  saveForLater(): void;

  reset(): void;
}

function initState(bundle: Bundle): BundleState {
  const base = buildInitialState(bundle);
  const persisted = loadPersistedProducts();
  if (!persisted) return base;
  const merged = { ...base.productsById };
  for (const id of Object.keys(merged)) {
    if (persisted[id]) merged[id] = persisted[id];
  }
  return { ...base, productsById: merged };
}

export function createBundleStore(bundle: Bundle): BundleStore {
  const reducer = createBundleReducer(bundle);
  let state = initState(bundle);
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  return {
    bundle,
    getState: () => state,
    dispatch: (action) => {
      const next = reducer(state, action);
      if (next !== state) {
        state = next;
        emit();
      }
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    saveForLater: () => saveState(state),
    reset: () => {
      clearState();
      state = buildInitialState(bundle);
      emit();
    },
  };
}
