import { cn } from '@/lib/cn';
import { ProductGlyph } from '@/shared/icons';
import type { ProductIcon } from '@/lib/schema';

export function Thumbnail({
  icon,
  size = 'md',
  className,
}: {
  icon: ProductIcon;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const dims = { sm: 'h-12 w-12', md: 'h-14 w-14', lg: 'h-28 w-full' }[size];
  const glyph = { sm: 'h-6 w-6', md: 'h-8 w-8', lg: 'h-16 w-16' }[size];
  return (
    <div
      className={cn(
        'grid shrink-0 place-items-center rounded-[var(--radius-control)] bg-card text-ink ring-1 ring-divider',
        dims,
        className
      )}
    >
      <ProductGlyph name={icon} className={glyph} />
    </div>
  );
}
