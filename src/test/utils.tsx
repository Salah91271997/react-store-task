import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { localBundle } from '@/lib/data';
import { BundleProvider } from '@/state';

export function renderWithStore(ui: ReactNode) {
  return render(<BundleProvider bundle={localBundle}>{ui}</BundleProvider>);
}
