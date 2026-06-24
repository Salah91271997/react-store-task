import { memo } from 'react';
import type { ReviewLine as ReviewLineType } from '@/state';
import { useBundleDispatch } from '@/state';
import { Price, QuantityStepper, Thumbnail } from '@/shared/ui';

export const ReviewLine = memo(function ReviewLine({ line }: { line: ReviewLineType }) {
  const dispatch = useBundleDispatch();
  const { product, variant, qty } = line;
  const name = product.required ? `${product.title} (Required)` : product.title;
  const displayName = line.showVariant && variant.label ? `${name} · ${variant.label}` : name;

  return (
    <li className="flex items-center gap-3 py-3">
      <Thumbnail icon={product.icon} size="sm" />
      <span className="flex-1 text-base font-medium text-ink">{displayName}</span>

      {product.hasStepper && (
        <QuantityStepper
          size="sm"
          tone="review"
          value={qty}
          min={product.minQty}
          label={`Quantity of ${name}`}
          onIncrement={() =>
            dispatch({ type: 'INCREMENT', productId: product.id, variantId: variant.id })
          }
          onDecrement={() =>
            dispatch({ type: 'DECREMENT', productId: product.id, variantId: variant.id })
          }
        />
      )}

      <Price
        price={line.lineActive}
        compareAt={variant.compareAt != null ? line.lineCompare : null}
        tone="review"
        suffix={product.priceSuffix}
      />
    </li>
  );
});
