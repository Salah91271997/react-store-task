import { fillTemplate, formatPrice } from '@/lib/money';
import { useBundleData, useBundleTotals, useReviewGroups } from '@/state';
import { GuaranteeSeal, Pill, SectionLabel } from '@/shared/ui';
import { TruckIcon } from '@/shared/icons';
import { ReviewLine } from './ReviewLine';
import { CheckoutSection } from './CheckoutSection';

export function ReviewPanel() {
  const bundle = useBundleData();
  const groups = useReviewGroups();
  const totals = useBundleTotals(groups);
  const { content, shipping, guarantee, financingLabel } = bundle;

  const savingsText = fillTemplate(content.savingsTemplate, {
    amount: formatPrice(totals.savings),
  });

  return (
    <aside
      aria-label={content.reviewTitle}
      className="@container rounded-[var(--radius-card)] bg-surface p-5 sm:p-6"
    >
      <div className="grid gap-x-10 gap-y-5 @4xl:grid-cols-[1.5fr_1fr]">
        <div className="flex min-w-0 flex-col gap-5">
          <header className="flex flex-col gap-1.5">
            <SectionLabel>{content.reviewEyebrow}</SectionLabel>
            <h2 className="text-2xl font-bold text-ink">{content.reviewTitle}</h2>
            <p className="text-sm text-body">{content.reviewSubtitle}</p>
          </header>

          {groups.length === 0 ? (
            <p className="py-6 text-center text-sm text-body">
              Your system is empty — add items to get started.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-divider border-y border-divider">
              {groups.map((group) => (
                <section key={group.category} className="py-3">
                  <SectionLabel as="h3" className="mb-1">
                    {group.label}
                  </SectionLabel>
                  <ul className="divide-y divide-divider">
                    {group.lines.map((line) => (
                      <ReviewLine key={line.key} line={line} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-[var(--radius-control)] bg-card text-success">
              <TruckIcon className="h-6 w-6" />
            </span>
            <span className="flex-1 text-sm font-medium text-ink">{shipping.label}</span>
            <span className="flex items-baseline gap-2">
              {shipping.compareAt != null && (
                <span className="text-sm text-strike-muted line-through">
                  {formatPrice(shipping.compareAt)}
                </span>
              )}
              <span className="text-sm font-semibold text-brand">
                {shipping.price === 0 ? 'FREE' : formatPrice(shipping.price)}
              </span>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5 @4xl:border-l @4xl:border-divider @4xl:pl-10">
          <div className="flex flex-wrap items-center gap-4">
            <GuaranteeSeal label={guarantee.sealText} />
            <div className="min-w-[12rem] flex-1">
              <h3 className="text-base font-semibold text-ink">{guarantee.title}</h3>
              <p className="text-sm text-body">{guarantee.body}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Pill>{financingLabel}</Pill>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-strike-muted line-through @4xl:text-lg">
                {formatPrice(totals.compareTotal)}
              </span>
              <span className="text-2xl font-bold text-brand @4xl:text-4xl">
                {formatPrice(totals.activeTotal)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {totals.savings > 0 && (
              <p className="text-center text-sm font-medium text-success">{savingsText}</p>
            )}
            <CheckoutSection content={content} />
          </div>
        </div>
      </div>
    </aside>
  );
}
