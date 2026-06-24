import { describe, expect, it } from 'vitest';
import { localBundle } from '@/lib/data';
import { buildInitialState, createBundleReducer } from './reducer';
import { clearState, loadPersistedProducts, saveState } from './persistence';
import { selectVariantQty } from './selectors';

const reducer = createBundleReducer(localBundle);
const STORAGE_KEY = 'bundle-builder:v1';

describe('persistence round-trip', () => {
  it('saves and restores the configuration exactly', () => {
    let s = buildInitialState(localBundle);
    s = reducer(s, {
      type: 'SET_VARIANT_QTY',
      productId: 'cam-v4',
      variantId: 'cam-v4-black',
      qty: 4,
    });
    saveState(s);

    const restored = loadPersistedProducts();
    expect(restored).not.toBeNull();

    const rehydrated = reducer(buildInitialState(localBundle), {
      type: 'HYDRATE',
      productsById: restored!,
    });
    expect(selectVariantQty(rehydrated, 'cam-v4', 'cam-v4-black')).toBe(4);
  });

  it('returns null when nothing is stored', () => {
    expect(loadPersistedProducts()).toBeNull();
  });

  it('ignores a version mismatch', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 999, productsById: {} }));
    expect(loadPersistedProducts()).toBeNull();
  });

  it('ignores corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    expect(loadPersistedProducts()).toBeNull();
  });

  it('clearState removes the stored config', () => {
    saveState(buildInitialState(localBundle));
    clearState();
    expect(loadPersistedProducts()).toBeNull();
  });
});
