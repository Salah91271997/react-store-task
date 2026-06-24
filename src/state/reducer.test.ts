import { describe, expect, it } from 'vitest';
import { localBundle } from '@/lib/data';
import { buildInitialState, createBundleReducer } from './reducer';
import { selectProductTotalQty, selectVariantQty } from './selectors';
import type { BundleState } from './types';

const reducer = createBundleReducer(localBundle);
const init = (): BundleState => buildInitialState(localBundle);

describe('buildInitialState (seed)', () => {
  it('seeds quantities to match the design', () => {
    const s = init();
    expect(selectVariantQty(s, 'cam-v4', 'cam-v4-white')).toBe(1);
    expect(selectVariantQty(s, 'cam-pan-v3', 'cam-pan-v3-white')).toBe(2);
    expect(selectVariantQty(s, 'motion-sensor', 'motion-sensor-default')).toBe(2);
    expect(selectVariantQty(s, 'sense-hub', 'sense-hub-default')).toBe(1);
    expect(selectVariantQty(s, 'microsd-256', 'microsd-256-default')).toBe(2);
    expect(selectVariantQty(s, 'cam-unlimited', 'cam-unlimited-default')).toBe(1);
  });

  it('binds the stepper to the seeded variant, else the first', () => {
    const s = init();
    expect(s.productsById['cam-v4'].selectedVariantId).toBe('cam-v4-white');

    expect(s.productsById['cam-floodlight-v2'].selectedVariantId).toBe('cam-floodlight-v2-white');
  });

  it('opens step 1 by default', () => {
    expect(init().openStepId).toBe('step-cameras');
  });
});

describe('quantity mutations', () => {
  it('increments and decrements a variant', () => {
    let s = init();
    s = reducer(s, { type: 'INCREMENT', productId: 'cam-v4', variantId: 'cam-v4-white' });
    expect(selectVariantQty(s, 'cam-v4', 'cam-v4-white')).toBe(2);
    s = reducer(s, { type: 'DECREMENT', productId: 'cam-v4', variantId: 'cam-v4-white' });
    expect(selectVariantQty(s, 'cam-v4', 'cam-v4-white')).toBe(1);
  });

  it('SET_VARIANT_QTY clamps below zero to zero', () => {
    let s = init();
    s = reducer(s, {
      type: 'SET_VARIANT_QTY',
      productId: 'cam-v4',
      variantId: 'cam-v4-white',
      qty: -5,
    });
    expect(selectVariantQty(s, 'cam-v4', 'cam-v4-white')).toBe(0);
  });

  it('enforces the minimum for a Required product (Sense Hub cannot drop below 1)', () => {
    let s = init();
    s = reducer(s, { type: 'DECREMENT', productId: 'sense-hub', variantId: 'sense-hub-default' });
    expect(selectVariantQty(s, 'sense-hub', 'sense-hub-default')).toBe(1);
    s = reducer(s, {
      type: 'SET_VARIANT_QTY',
      productId: 'sense-hub',
      variantId: 'sense-hub-default',
      qty: 0,
    });
    expect(selectVariantQty(s, 'sense-hub', 'sense-hub-default')).toBe(1);
  });
});

describe('variant-scoped quantities (the core requirement)', () => {
  it('tracks each variant independently and keeps the stepper bound to the active one', () => {
    let s = init();

    s = reducer(s, {
      type: 'SET_VARIANT_QTY',
      productId: 'cam-v4',
      variantId: 'cam-v4-grey',
      qty: 2,
    });

    s = reducer(s, { type: 'SELECT_VARIANT', productId: 'cam-v4', variantId: 'cam-v4-black' });

    const activeId = s.productsById['cam-v4'].selectedVariantId;
    expect(activeId).toBe('cam-v4-black');
    expect(selectVariantQty(s, 'cam-v4', activeId)).toBe(0);

    expect(selectVariantQty(s, 'cam-v4', 'cam-v4-grey')).toBe(2);
    expect(selectVariantQty(s, 'cam-v4', 'cam-v4-white')).toBe(1);

    const product = localBundle.products.find((p) => p.id === 'cam-v4')!;
    expect(selectProductTotalQty(s, product)).toBe(3);
  });

  it('SELECT_VARIANT never changes any quantity', () => {
    const s = init();
    const next = reducer(s, {
      type: 'SELECT_VARIANT',
      productId: 'cam-v4',
      variantId: 'cam-v4-black',
    });
    expect(next.productsById['cam-v4'].quantities).toEqual(s.productsById['cam-v4'].quantities);
  });
});

describe('TOGGLE_PRODUCT (select / unselect)', () => {
  it('selects an unselected product (qty 0 -> 1 on the active variant)', () => {
    let s = init();
    expect(selectVariantQty(s, 'cam-floodlight-v2', 'cam-floodlight-v2-white')).toBe(0);
    s = reducer(s, { type: 'TOGGLE_PRODUCT', productId: 'cam-floodlight-v2' });
    expect(selectVariantQty(s, 'cam-floodlight-v2', 'cam-floodlight-v2-white')).toBe(1);
  });

  it('unselects a selected product (clears every variant to 0)', () => {
    let s = init();
    s = reducer(s, { type: 'SET_VARIANT_QTY', productId: 'cam-v4', variantId: 'cam-v4-black', qty: 3 });
    s = reducer(s, { type: 'TOGGLE_PRODUCT', productId: 'cam-v4' });
    const product = localBundle.products.find((p) => p.id === 'cam-v4')!;
    expect(selectProductTotalQty(s, product)).toBe(0);
  });

  it('cannot unselect a Required product', () => {
    let s = init();
    s = reducer(s, { type: 'TOGGLE_PRODUCT', productId: 'sense-hub' });
    expect(selectVariantQty(s, 'sense-hub', 'sense-hub-default')).toBe(1);
  });
});

describe('accordion', () => {
  it('toggles a step open/closed and opens another', () => {
    let s = init();
    s = reducer(s, { type: 'TOGGLE_STEP', stepId: 'step-cameras' });
    expect(s.openStepId).toBeNull();
    s = reducer(s, { type: 'OPEN_STEP', stepId: 'step-plan' });
    expect(s.openStepId).toBe('step-plan');
  });
});

describe('HYDRATE / RESET', () => {
  it('HYDRATE replaces config but keeps the default open step', () => {
    const s = init();
    const hydrated = reducer(s, {
      type: 'HYDRATE',
      productsById: {
        ...s.productsById,
        'cam-v4': { selectedVariantId: 'cam-v4-black', quantities: { 'cam-v4-black': 9 } },
      },
    });
    expect(selectVariantQty(hydrated, 'cam-v4', 'cam-v4-black')).toBe(9);
    expect(hydrated.openStepId).toBe('step-cameras');
  });

  it('RESET returns to the seeded state', () => {
    let s = init();
    s = reducer(s, {
      type: 'SET_VARIANT_QTY',
      productId: 'cam-v4',
      variantId: 'cam-v4-white',
      qty: 99,
    });
    s = reducer(s, { type: 'RESET' });
    expect(selectVariantQty(s, 'cam-v4', 'cam-v4-white')).toBe(1);
  });
});
