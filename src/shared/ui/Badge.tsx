export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-brand px-2.5 py-1 text-xs font-semibold text-brand-foreground">
      {children}
    </span>
  );
}
