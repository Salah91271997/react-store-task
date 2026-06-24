import { describe, expect, it } from 'vitest';
import { localBundle } from '@/lib/data';
import { buildInitialState, createBundleReducer } from './reducer';
import { selectReviewGroups, selectStepSelectionCount, selectTotals } from './selectors';

const reducer = createBundleReducer(localBundle);

describe('review groups projection', () => {
  it('groups seeded selections in the fixed review order', () => {
    const groups = selectReviewGroups(localBundle, buildInitialState(localBundle));
    expect(groups.map((g) => g.category)).toEqual(['cameras', 'sensors', 'accessories', 'plan']);
    expect(groups[0].lines.map((l) => l.product.id)).toEqual(['cam-v4', 'cam-pan-v3']);
  });

  it('shows every variant with qty > 0 as its own line', () => {
    let s = buildInitialState(localBundle);
    s = reducer(s, {
      type: 'SET_VARIANT_QTY',
      productId: 'cam-v4',
      variantId: 'cam-v4-black',
      qty: 3,
    });
    const cameras = selectReviewGroups(localBundle, s).find((g) => g.category === 'cameras')!;
    const v4Lines = cameras.lines.filter((l) => l.product.id === 'cam-v4');
    expect(v4Lines).toHaveLength(2);
    expect(v4Lines.map((l) => l.qty).sort()).toEqual([1, 3]);
  });

  it('omits products with zero quantity', () => {
    const groups = selectReviewGroups(localBundle, buildInitialState(localBundle));
    const allIds = groups.flatMap((g) => g.lines.map((l) => l.product.id));
    expect(allIds).not.toContain('duo-doorbell');
    expect(allIds).not.toContain('cam-floodlight-v2');
  });
});

describe('totals (card-unit source of truth)', () => {
  it('computes the seeded totals and the exact mockup savings', () => {
    const groups = selectReviewGroups(localBundle, buildInitialState(localBundle));
    const totals = selectTotals(groups);
    expect(totals.activeTotal).toBe(209.87);
    expect(totals.compareTotal).toBe(260.79);
    expect(totals.savings).toBe(50.92);
  });

  it('recalculates live as quantities change', () => {
    let s = buildInitialState(localBundle);
    s = reducer(s, { type: 'INCREMENT', productId: 'cam-v4', variantId: 'cam-v4-white' });
    const totals = selectTotals(selectReviewGroups(localBundle, s));
    expect(totals.activeTotal).toBe(237.85);
  });
});

describe('"N selected" per step', () => {
  it('counts distinct products with qty > 0 in each category', () => {
    const s = buildInitialState(localBundle);
    expect(selectStepSelectionCount(localBundle, s, 'cameras')).toBe(2);
    expect(selectStepSelectionCount(localBundle, s, 'plan')).toBe(1);
    expect(selectStepSelectionCount(localBundle, s, 'sensors')).toBe(2);
    expect(selectStepSelectionCount(localBundle, s, 'accessories')).toBe(1);
  });

  it('counts a product once regardless of variant count', () => {
    let s = buildInitialState(localBundle);
    s = reducer(s, {
      type: 'SET_VARIANT_QTY',
      productId: 'cam-v4',
      variantId: 'cam-v4-black',
      qty: 5,
    });
    expect(selectStepSelectionCount(localBundle, s, 'cameras')).toBe(2);
  });
});
