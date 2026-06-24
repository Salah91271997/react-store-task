import type { Product } from '@/lib/schema';
import { useBundleDispatch, useSelectedVariantId } from '@/state';
import { VariantChip } from '@/shared/ui';

export function VariantSelector({ product }: { product: Product }) {
  const dispatch = useBundleDispatch();
  const selectedId = useSelectedVariantId(product);

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={`${product.title} color`}>
      {product.variants.map((variant) => (
        <VariantChip
          key={variant.id}
          label={variant.label}
          swatch={variant.swatch}
          selected={variant.id === selectedId}
          onClick={() =>
            dispatch({ type: 'SELECT_VARIANT', productId: product.id, variantId: variant.id })
          }
        />
      ))}
    </div>
  );
}
