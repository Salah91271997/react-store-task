# Bundle Builder

A multi-step **security-system bundle builder** with a live, recalculating review panel —
built as a production-minded React prototype.

Choose cameras, a plan, sensors, and extra protection through a 4-step accordion while a
summary panel beside it prices the system live, tracks per-variant quantities, and persists
the shopper's configuration across visits.

> **Live demo:** _add your deployment URL here (Vercel/Netlify)_

---

## Quick start

Requires **Node 20+**.

```bash
npm install        # install dependencies
npm run dev        # start the app at http://localhost:5173
```

Optional — run the bonus API alongside the app:

```bash
npm run dev:all    # runs the Vite app + the Express API together
# or, in a second terminal:
npm run server     # Express API at http://localhost:8787/api
```

The app works **with or without** the server: it fetches data from `/api/bundle` and falls
back to a validated local JSON file if the API is offline, so a clean clone always runs.

### All scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server (app only) |
| `npm run server` | Express + Zod API |
| `npm run dev:all` | App + API together |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview the production build |
| `npm test` | Unit + integration tests (Vitest) |
| `npm run typecheck` | Typecheck app **and** server |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

---

## What it does

- **4-step accordion builder** — Cameras, Plan, Sensors, Extra protection. One step open at a
  time; Step 1 open on load; keyboard accessible.
- **Data-driven product cards** — optional discount badge, image, description, "Learn More",
  color/variant selector, quantity stepper, and compare-at pricing. Each card renders only
  what its data provides (the doorbell has no variants/badge; the plan has no stepper).
- **Variant-scoped quantities** — each color variant tracks its own count; the card's stepper
  is bound to the active variant; the review panel shows every variant with qty > 0 as its
  own line.
- **Live review panel** — grouped line items, synced steppers, shipping, satisfaction
  guarantee, financing line, recalculating total with savings callout, Checkout, and a
  working **Save my system for later**.
- **Persistence** — configure → leave → return and it's restored exactly (localStorage).
- **Responsive** — side-by-side rail on desktop, stacked and usable down to phone widths.

---

## Architecture

```
src/
  app/         App shell, ErrorBoundary, layout
  features/
    builder/   Accordion, Step, ProductCard, VariantSelector  (lazy-loaded step content)
    review/    ReviewPanel, ReviewLine, CheckoutSection
  state/       store (build-your-own), reducer, selectors, hooks, persistence
  shared/
    ui/        design-system primitives (Button, Price, QuantityStepper, …)
    icons.tsx  inline SVG glyphs (keeps the app asset-free)
  lib/         schema (Zod), money, data loader, cn
  data/        bundle.json — the single seed source of truth
server/        Express + Zod API (bonus): routes / controllers / services / middleware
```

### State management — Context + reducer, made fine-grained

The trickiest requirement is **bidirectional, variant-scoped quantity sync**. The approach:

- **Normalized state** keyed by `productsById[id].variants[variantId].qty`, so Red and Blue
  counts are independent and lookups are O(1). The card stepper just reads the *active*
  variant; the review panel reads *all* variants with qty > 0.
- **A pure reducer** (`createBundleReducer`) holds every mutation rule (clamping, the
  "Required" minimum, variant selection). Being pure, it's unit-tested with no React at all.
- **A tiny store** (`createBundleStore`) wraps the reducer with `subscribe`/`getState`, and
  components subscribe via **`useSyncExternalStore` + selectors** — so a component re-renders
  **only when its slice changes**, not on every state change. This is the fine-grained,
  no-dependency "build-your-own-Zustand" pattern; the store reference is stable, so Context
  itself never triggers renders.
- **Custom hooks** are the store's public API: `useActiveVariant`, `useVariantQty`,
  `useStepSelectionCount`, `useReviewGroups`, `useBundleTotals`, `useBundleActions`.

### Design system

Three token tiers in `src/index.css` via Tailwind v4 `@theme`: raw palette → **semantic
tokens** (`--color-brand`, `--color-strike-sale`, …) → Tailwind utilities. Components
reference only semantic tokens, so the palette/brand is swappable in one place. The
strike-through price has two intentional tones — **red on cards, gray in the review** —
handled by a single `<Price tone>` component.

### Data & validation

`bundle.json` is validated by a **Zod schema** that is also the source of the TypeScript
types (`z.infer`), so data, runtime validation, and static types can't drift. The Express
server validates with the **same** schema, and a `POST /api/quote` endpoint recomputes
totals server-side (pricing can't be tampered client-side).

---

## Testing

35 tests across the stack (`npm test`):

- **Reducer** — variant-quantity invariants (add 2 of one color, switch color → stepper
  reads 0 while the first color stays in the review), clamping, the "Required" minimum,
  hydrate/reset.
- **Selectors** — review grouping, seeded totals (**$209.87 / $260.79 / $50.92 savings**),
  live recalculation, "N selected" counts.
- **Persistence** — save/restore round-trip, version-mismatch and corrupt-data guards.
- **Integration (React Testing Library)** — card ↔ review stepper sync, the variant flow
  through to the review, accordion ARIA/toggle behavior, disabled "Required" stepper, and a
  full **save → unmount → restore** journey.
- **API (Supertest)** — every endpoint, including server-side quote totals.

---

## Decisions & tradeoffs

- **The Figma's prices don't reconcile.** A card's unit price doesn't multiply up to its
  review line total (Wyze Cam Pan v3: $34.98/unit on the card, but $47.98 for qty 2 in the
  review — implying $23.99/unit). Since the brief requires a **live, correct total**, two
  contradictory price sources can't coexist. I chose the **card unit price as the single
  source of truth** and compute every line and total from it. The seeded grand total
  therefore computes to **$209.87** rather than the mockup's printed **$187.89** — but the
  headline **savings ($50.92) matches the mockup exactly**, and the math is always
  internally consistent and auditable.
- **Steps 2–4 cards aren't in the Figma** (only Step 1 is shown expanded). I reuse the same
  data-driven `ProductCard` for them and seed only the products evidenced by the review panel
  (the plan, the two sensors, the accessory) — I didn't invent SKUs that weren't shown.
- **Product imagery** is represented by clean inline-SVG glyphs rather than hotlinked Wyze
  photos (no licensing/availability concerns, fully self-contained, swappable via the
  `icon` field in the data).
- **Persistence is automatic *and* explicit.** Changes autosave (debounced) so work is never
  lost, and "Save my system for later" performs an immediate save with confirmation.
- **Counter visibility** follows the frames: the open step always shows "N selected";
  collapsed steps show it on mobile only.

## What I'd do next

- Deploy + wire the live-demo link.
- Framer-Motion accordion transitions; sticky mobile mini-summary bar.
- Playwright E2E and Storybook for the design system.
- Server-persisted carts tied to a customer account (cross-device + abandoned-cart recovery).

---

## Project context docs

Background written during planning: [`01_BUSINESS_INSIGHTS.md`](./01_BUSINESS_INSIGHTS.md),
[`02_TECHNICAL_IMPLEMENTATION.md`](./02_TECHNICAL_IMPLEMENTATION.md),
[`03_REQUIREMENTS_AND_IMPROVEMENTS.md`](./03_REQUIREMENTS_AND_IMPROVEMENTS.md).
