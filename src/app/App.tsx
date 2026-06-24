import { useEffect, useState } from 'react';
import type { Bundle } from '@/lib/schema';
import { fetchBundle } from '@/lib/data';
import { BundleProvider } from '@/state';
import { ErrorBoundary } from './ErrorBoundary';
import { Layout } from './Layout';

export function App() {
  const [bundle, setBundle] = useState<Bundle | null>(null);

  useEffect(() => {
    let active = true;
    fetchBundle().then((b) => {
      if (active) setBundle(b);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <ErrorBoundary>
      {bundle ? (
        <BundleProvider bundle={bundle}>
          <Layout />
        </BundleProvider>
      ) : (
        <LoadingScreen />
      )}
    </ErrorBoundary>
  );
}

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center" aria-busy="true" aria-live="polite">
      <span className="text-sm text-body">Loading your bundle builder…</span>
    </div>
  );
}
