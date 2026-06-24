import { useBundleData } from '@/state';
import { Step } from './Step';

export function Accordion() {
  const { steps } = useBundleData();

  return (
    <div className="divide-y divide-divider overflow-hidden rounded-[var(--radius-card)] ring-1 ring-divider">
      {steps.map((step, i) => (
        <Step
          key={step.id}
          step={step}
          totalSteps={steps.length}
          nextStepId={steps[i + 1]?.id ?? null}
        />
      ))}
    </div>
  );
}
