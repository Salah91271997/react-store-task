import { createContext } from 'react';
import type { BundleStore } from './store';

export const StoreContext = createContext<BundleStore | null>(null);
