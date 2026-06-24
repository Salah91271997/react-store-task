import { cn } from '@/lib/cn';

const RING_TEXT = 'TRY WORRY-FREE FOR 30 DAYS • TRY WORRY-FREE FOR 30 DAYS • ';

export function GuaranteeSeal({ label, className }: { label: string; className?: string }) {
  const petals = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    return { cx: 50 + Math.cos(angle) * 41, cy: 50 + Math.sin(angle) * 41 };
  });

  return (
    <div className={cn('relative h-24 w-24 shrink-0', className)} role="img" aria-label={label}>
      <svg viewBox="0 0 100 100" className="h-full w-full text-brand" aria-hidden focusable="false">
        {petals.map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r="9" fill="currentColor" />
        ))}
        <circle cx="50" cy="50" r="42" fill="currentColor" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="white" strokeOpacity="0.45" strokeWidth="0.75" />
        <defs>
          <path id="seal-ring" d="M50,50 m-33.5,0 a33.5,33.5 0 1,1 67,0 a33.5,33.5 0 1,1 -67,0" fill="none" />
        </defs>
        <text fill="white" fontSize="5.8" fontWeight="600" letterSpacing="0.2">
          <textPath href="#seal-ring" startOffset="0">
            {RING_TEXT}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center text-brand-foreground">
        <div>
          <div className="text-base font-extrabold leading-none">100%</div>
          <div className="mt-1 text-[7px] font-semibold uppercase leading-[1.15] tracking-wide">
            Wyze
            <br />
            satisfaction
            <br />
            guarantee
          </div>
        </div>
      </div>
    </div>
  );
}
