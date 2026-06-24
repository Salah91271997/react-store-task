import { useEffect, useState } from 'react';
import type { Bundle } from '@/lib/schema';
import { useBundleActions } from '@/state';
import { Button } from '@/shared/ui';

export function CheckoutSection({ content }: { content: Bundle['content'] }) {
  const { saveForLater } = useBundleActions();
  const [checkedOut, setCheckedOut] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const id = window.setTimeout(() => setSaved(false), 2500);
    return () => window.clearTimeout(id);
  }, [saved]);

  return (
    <div className="flex flex-col gap-3">
      <Button fullWidth size="lg" onClick={() => setCheckedOut(true)}>
        {content.checkoutLabel}
      </Button>

      {checkedOut && (
        <p role="status" className="text-center text-sm font-medium text-success">
          🎉 Order confirmed — thanks for building with us!
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          saveForLater();
          setSaved(true);
        }}
        className="mx-auto text-sm italic text-muted underline underline-offset-2 hover:text-ink"
      >
        {content.saveForLaterLabel}
      </button>

      {saved && (
        <p role="status" className="text-center text-xs font-medium text-success">
          Your system has been saved — it’ll be here when you return.
        </p>
      )}
    </div>
  );
}
