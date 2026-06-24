import type { BundleState, PersistedState, ProductState } from './types';

const STORAGE_KEY = 'bundle-builder:v1';
const SCHEMA_VERSION = 1;

export function saveState(state: BundleState): void {
  try {
    const payload: PersistedState = {
      version: SCHEMA_VERSION,
      productsById: state.productsById,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {}
}

export function loadPersistedProducts(): Record<string, ProductState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (parsed?.version !== SCHEMA_VERSION || typeof parsed.productsById !== 'object') {
      return null;
    }
    return parsed.productsById ?? null;
  } catch {
    return null;
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
