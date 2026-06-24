import { cn } from '@/lib/cn';

export function VariantChip({
  label,
  swatch,
  selected,
  onClick,
}: {
  label: string;
  swatch: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'inline-flex items-center gap-2 rounded-[var(--radius-control)] border px-3 py-1.5 text-sm font-medium transition',
        selected ? 'border-brand text-ink' : 'border-divider text-body hover:border-step-icon'
      )}
    >
      <span
        className="h-4 w-4 rounded-full border border-black/10"
        style={{ backgroundColor: swatch }}
        aria-hidden
      />
      {label}
    </button>
  );
}
