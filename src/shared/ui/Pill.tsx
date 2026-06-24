import { cn } from '@/lib/cn';

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[6px] bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground',
        className
      )}
    >
      {children}
    </span>
  );
}
