import type { ProductIcon, StepIcon } from '@/lib/schema';

type SvgProps = React.SVGProps<SVGSVGElement>;

const base = (props: SvgProps): SvgProps => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
  ...props,
});

export function StepGlyph({ name, ...props }: { name: StepIcon } & SvgProps) {
  switch (name) {
    case 'cameras':
      return (
        <svg {...base(props)}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <circle cx="12" cy="12" r="3" />
          <path d="M9 21h6" />
        </svg>
      );
    case 'plan':
      return (
        <svg {...base(props)}>
          <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
        </svg>
      );
    case 'sensors':
      return (
        <svg {...base(props)}>
          <path d="M5 12a7 7 0 0 1 14 0" />
          <path d="M8 12a4 4 0 0 1 8 0" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        </svg>
      );
    case 'protection':
      return (
        <svg {...base(props)}>
          {[6, 12, 18].map((cy) =>
            [6, 12, 18].map((cx) => (
              <circle
                key={`${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r="1.3"
                fill="currentColor"
                stroke="none"
              />
            ))
          )}
        </svg>
      );
  }
}

export function ProductGlyph({ name, ...props }: { name: ProductIcon } & SvgProps) {
  switch (name) {
    case 'camera':
      return (
        <svg {...base(props)}>
          <rect x="5" y="6" width="14" height="11" rx="2.5" />
          <circle cx="12" cy="11.5" r="3.2" />
          <circle cx="12" cy="11.5" r="1.1" fill="currentColor" />
        </svg>
      );
    case 'cameraPan':
      return (
        <svg {...base(props)}>
          <rect x="7" y="4" width="10" height="8" rx="2" />
          <circle cx="12" cy="8" r="2" />
          <rect x="9" y="13" width="6" height="3" rx="1" />
          <path d="M6 19c2-1.5 10-1.5 12 0" />
        </svg>
      );
    case 'floodlight':
      return (
        <svg {...base(props)}>
          <rect x="3" y="4" width="7" height="4" rx="1.5" />
          <rect x="14" y="4" width="7" height="4" rx="1.5" />
          <path d="M12 8v3" />
          <rect x="9" y="11" width="6" height="5" rx="1.5" />
          <circle cx="12" cy="13.5" r="1.2" />
        </svg>
      );
    case 'doorbell':
      return (
        <svg {...base(props)}>
          <rect x="7" y="3" width="10" height="18" rx="3" />
          <circle cx="12" cy="8" r="1.8" />
          <circle cx="12" cy="15" r="2.6" />
        </svg>
      );
    case 'batteryCam':
      return (
        <svg {...base(props)}>
          <rect x="5" y="7" width="14" height="10" rx="4" />
          <circle cx="11" cy="12" r="3" />
          <circle cx="11" cy="12" r="1" fill="currentColor" />
        </svg>
      );
    case 'motionSensor':
      return (
        <svg {...base(props)}>
          <rect x="6" y="5" width="12" height="14" rx="3" />
          <path d="M9.5 10a3.5 3.5 0 0 1 5 0" />
          <path d="M11 13a1.6 1.6 0 0 1 2 0" />
        </svg>
      );
    case 'hub':
      return (
        <svg {...base(props)}>
          <rect x="4" y="10" width="16" height="7" rx="2.5" />
          <path d="M8 10V8a4 4 0 0 1 8 0v2" />
          <circle cx="8" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
          <path d="M12 13h4" />
        </svg>
      );
    case 'sdcard':
      return (
        <svg {...base(props)}>
          <path d="M8 3h6l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
          <path d="M10 3v3M12.5 3v3M15 5v2" />
        </svg>
      );
    case 'plan':
      return (
        <svg {...base(props)}>
          <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
          <path d="M9 11.5l2 2 4-4" />
        </svg>
      );
  }
}

export function ChevronIcon({
  direction = 'down',
  ...props
}: { direction?: 'up' | 'down' } & SvgProps) {
  return (
    <svg
      {...base({ strokeWidth: 2, ...props })}
      style={{ transform: direction === 'up' ? 'rotate(180deg)' : undefined, ...props.style }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function TruckIcon(props: SvgProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 7h10v8H3z" />
      <path d="M13 10h4l3 3v2h-7z" />
      <circle cx="7" cy="17" r="1.6" />
      <circle cx="17" cy="17" r="1.6" />
    </svg>
  );
}

export function PlusIcon(props: SvgProps) {
  return (
    <svg {...base({ strokeWidth: 2, ...props })}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon(props: SvgProps) {
  return (
    <svg {...base({ strokeWidth: 2, ...props })}>
      <path d="M5 12h14" />
    </svg>
  );
}
