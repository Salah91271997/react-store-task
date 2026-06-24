import { useEffect, useRef, type ReactNode } from 'react';
import type { Bundle } from '@/lib/schema';
import { StoreContext } from './contexts';
import { createBundleStore, type BundleStore } from './store';

const AUTOSAVE_DEBOUNCE_MS = 400;

export function BundleProvider({
  bundle,
  children,
  store: injectedStore,
}: {
  bundle: Bundle;
  children: ReactNode;

  store?: BundleStore;
}) {
  const storeRef = useRef<BundleStore | null>(injectedStore ?? null);
  if (!storeRef.current) storeRef.current = createBundleStore(bundle);
  const store = storeRef.current;

  useEffect(() => {
    let timer: number | undefined;
    const unsubscribe = store.subscribe(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => store.saveForLater(), AUTOSAVE_DEBOUNCE_MS);
    });
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [store]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
