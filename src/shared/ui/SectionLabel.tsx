import { cn } from '@/lib/cn';

export function SectionLabel({
  children,
  className,
  as: As = 'span',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'span' | 'h3' | 'p';
}) {
  return (
    <As className={cn('text-xs font-medium uppercase tracking-wider text-subtle', className)}>
      {children}
    </As>
  );
}
