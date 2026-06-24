import { cn } from '@/lib/cn';

type Variant = 'primary' | 'outline';
type Size = 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-brand-foreground hover:brightness-110 active:brightness-95',
  outline: 'border border-brand text-brand bg-card hover:bg-brand/5',
};

const sizes: Record<Size, string> = {
  md: 'px-5 py-3 text-sm rounded-[var(--radius-control)]',
  lg: 'px-6 py-4 text-base rounded-[14px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition',
        'disabled:cursor-not-allowed disabled:opacity-50',
        sizes[size],
        variants[variant],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    />
  );
}
