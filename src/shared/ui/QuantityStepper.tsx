import { cn } from '@/lib/cn';
import { MinusIcon, PlusIcon } from '@/shared/icons';

interface QuantityStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  label: string;
  size?: 'sm' | 'md';
  tone?: 'card' | 'review';
}

const sizes = {
  sm: { btn: 'h-6 w-6', num: 'w-6 text-sm', icon: 'h-3.5 w-3.5', gap: 'gap-1.5' },
  md: { btn: 'h-9 w-9', num: 'w-9 text-base', icon: 'h-4 w-4', gap: 'gap-2' },
} as const;

export function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  min = 0,
  label,
  size = 'md',
  tone = 'card',
}: QuantityStepperProps) {
  const s = sizes[size];
  const decDisabled = value <= min;

  const btnBase = cn(
    'grid place-items-center rounded-[var(--radius-control)] text-step-icon transition hover:brightness-95',
    s.btn
  );
  const minusBg = tone === 'card' ? 'bg-step-minus' : 'bg-card ring-1 ring-divider';
  const plusBg = tone === 'card' ? 'bg-step-plus' : 'bg-card ring-1 ring-divider';

  return (
    <div className={cn('inline-flex items-center', s.gap)} role="group" aria-label={label}>
      <button
        type="button"
        onClick={onDecrement}
        disabled={decDisabled}
        aria-label="Decrease quantity"
        className={cn(btnBase, minusBg, 'disabled:cursor-not-allowed disabled:opacity-40')}
      >
        <MinusIcon className={s.icon} />
      </button>

      <span
        className={cn('text-center font-medium text-ink tabular-nums', s.num)}
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={onIncrement}
        aria-label="Increase quantity"
        className={cn(btnBase, plusBg)}
      >
        <PlusIcon className={s.icon} />
      </button>
    </div>
  );
}
