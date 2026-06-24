import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/money';

interface PriceProps {
  price: number;
  compareAt?: number | null;
  tone: 'card' | 'review';
  suffix?: string;
}

export function Price({ price, compareAt, tone, suffix = '' }: PriceProps) {
  const isFree = price === 0;

  const compare = compareAt != null && (
    <span
      className={cn(
        'text-sm line-through',
        tone === 'card' ? 'text-strike-sale' : 'text-strike-muted'
      )}
    >
      {formatPrice(compareAt)}
      {suffix}
    </span>
  );

  const active = (
    <span className={cn('font-semibold', isFree || tone === 'review' ? 'text-brand' : 'text-body')}>
      {isFree ? 'FREE' : `${formatPrice(price)}${suffix}`}
    </span>
  );

  if (tone === 'review') {
    return (
      <div className="flex items-baseline justify-end gap-2 whitespace-nowrap">
        {compare}
        {active}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end leading-tight">
      {compare}
      {active}
    </div>
  );
}
