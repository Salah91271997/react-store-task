import { useMemo } from 'react';
import type { Category } from '@/lib/schema';
import { useBundleData } from '@/state';
import { ProductCard } from './ProductCard';

export default function StepProducts({ category }: { category: Category }) {
  const bundle = useBundleData();
  const products = useMemo(
    () => bundle.products.filter((p) => p.category === category),
    [bundle, category]
  );

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
