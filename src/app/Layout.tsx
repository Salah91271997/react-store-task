import { useBundleData } from '@/state';
import { Accordion } from '@/features/builder';
import { ReviewPanel } from '@/features/review';

export function Layout() {
  const { content } = useBundleData();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-center text-3xl font-bold text-ink sm:text-4xl lg:text-left">
        {content.pageHeading}
      </h1>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_24rem] xl:grid-cols-[1fr_26rem] 2xl:grid-cols-1">
        <Accordion />
        <div className="lg:sticky lg:top-6 2xl:static">
          <ReviewPanel />
        </div>
      </div>
    </main>
  );
}
