import { memo } from 'react';
import type { Product } from '@/lib/schema';
import { cn } from '@/lib/cn';
import { useActiveVariant, useBundleDispatch, useProductTotalQty } from '@/state';
import { Badge, Button, Price, QuantityStepper, Thumbnail } from '@/shared/ui';
import { VariantSelector } from './VariantSelector';

export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const dispatch = useBundleDispatch();
  const { variantId, qty } = useActiveVariant(product);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const isSelected = useProductTotalQty(product) > 0;

  const toggle = () => dispatch({ type: 'TOGGLE_PRODUCT', productId: product.id });

  // Clicking the card toggles selection — unless the click landed on a real control
  // (stepper, variant chip, Learn More, the Select button), which handle themselves.
  const onCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    toggle();
  };

  return (
    <article
      onClick={onCardClick}
      className={cn(
        'relative flex cursor-pointer flex-col gap-3 rounded-[var(--radius-card)] bg-card p-4',
        'transition duration-200 hover:-translate-y-0.5 hover:shadow-md',
        isSelected ? 'ring-2 ring-brand' : 'ring-1 ring-divider'
      )}
      aria-label={product.title}
    >
      {product.badge && (
        <div className="absolute left-3 top-3 z-10">
          <Badge>{product.badge}</Badge>
        </div>
      )}

      <Thumbnail icon={product.icon} size="lg" />

      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-base font-semibold text-ink">{product.title}</h3>
        <p className="text-sm text-body">
          {product.description}{' '}
          {product.learnMore && (
            <button
              type="button"
              className="font-medium text-link underline underline-offset-2"
              aria-label={`Learn more about ${product.title}`}
            >
              Learn More
            </button>
          )}
        </p>

        {product.hasVariants && <VariantSelector product={product} />}

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          {product.hasStepper ? (
            <QuantityStepper
              value={qty}
              min={product.minQty}
              label={`Quantity of ${product.title}`}
              onIncrement={() => dispatch({ type: 'INCREMENT', productId: product.id, variantId })}
              onDecrement={() => dispatch({ type: 'DECREMENT', productId: product.id, variantId })}
            />
          ) : (
            <Button variant={isSelected ? 'primary' : 'outline'} onClick={toggle}>
              {isSelected ? 'Selected' : 'Select'}
            </Button>
          )}
          <Price
            price={variant.price}
            compareAt={variant.compareAt}
            tone="card"
            suffix={product.priceSuffix}
          />
        </div>
      </div>
    </article>
  );
});
