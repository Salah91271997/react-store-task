import { lazy, Suspense } from 'react';
import type { Step as StepType } from '@/lib/schema';
import { cn } from '@/lib/cn';
import { useBundleDispatch, useOpenStepId, useStepSelectionCount } from '@/state';
import { Button, SectionLabel } from '@/shared/ui';
import { ChevronIcon, StepGlyph } from '@/shared/icons';

const StepProducts = lazy(() => import('./StepProducts'));

interface StepProps {
  step: StepType;
  totalSteps: number;

  nextStepId: string | null;
}

export function Step({ step, totalSteps, nextStepId }: StepProps) {
  const dispatch = useBundleDispatch();
  const openStepId = useOpenStepId();
  const selectedCount = useStepSelectionCount(step.category);
  const isOpen = openStepId === step.id;

  const panelId = `${step.id}-panel`;
  const headerId = `${step.id}-header`;
  const countLabel = `${selectedCount} selected`;

  return (
    <section className={cn(isOpen ? 'bg-surface' : 'bg-card')}>
      <h2>
        <button
          id={headerId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => dispatch({ type: 'TOGGLE_STEP', stepId: step.id })}
          className="flex w-full items-center gap-3 px-5 py-4 text-left"
        >
          <span className="flex flex-1 flex-col gap-1.5">
            <SectionLabel>{`Step ${step.index} of ${totalSteps}`}</SectionLabel>
            <span className="flex items-center gap-2.5">
              <StepGlyph name={step.icon} className="h-6 w-6 text-ink" />
              <span className="text-xl font-semibold text-ink">{step.title}</span>
            </span>
          </span>

          <span className="flex items-center gap-2 text-sm font-medium text-brand">
            {isOpen ? (
              <span>{countLabel}</span>
            ) : (
              selectedCount > 0 && <span className="sm:hidden">{countLabel}</span>
            )}
            <ChevronIcon
              direction={isOpen ? 'up' : 'down'}
              className="h-4 w-4 transition-transform duration-200"
            />
          </span>
        </button>
      </h2>

      <div id={panelId} role="region" aria-labelledby={headerId} hidden={!isOpen}>
        {isOpen && (
          <div className="animate-fade-up flex flex-col gap-5 px-5 pb-6">
            <Suspense fallback={<StepSkeleton />}>
              <StepProducts category={step.category} />
            </Suspense>
            {step.nextLabel && nextStepId && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => dispatch({ type: 'OPEN_STEP', stepId: nextStepId })}
                >
                  {`Next: ${step.nextLabel}`}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function StepSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-4" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-64 animate-pulse rounded-[var(--radius-card)] bg-card/70" />
      ))}
    </div>
  );
}
