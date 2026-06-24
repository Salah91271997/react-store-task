# Technical Implementation

> The full engineering design for the Bundle Builder prototype — architecture, state, UI
> system, server, testing, and the reasoning behind each choice. Written to be read by senior
> frontend engineers evaluating the submission.

---

## 1. Stack at a glance

| Concern | Choice | Why |
|---|---|---|
| Build tool | **Vite** | Fast dev/HMR, lean output, no SSR overhead a prototype doesn't need. Pairs cleanly with a separate Express server. |
| Language | **TypeScript (strict)** | Type-safety end to end; types inferred from the data schema (one source of truth). |
| Styling | **Tailwind CSS v4** + `@theme` design tokens | Tokenized design system, not magic hexes. |
| State | **React Context + `useReducer`** (split contexts, normalized) | Right-sized for a single bounded configurator; demonstrates command of React's render model. |
| Validation | **Zod** | Runtime validation of the JSON data **and** inferred static types. |
| Data API (bonus) | **Express + Zod** | Serves the validated bundle JSON over HTTP. |
| Persistence | **localStorage** via a custom `usePersistedReducer` | "Save my system for later" — hydrate on load, save on change. |
| Testing | **Vitest + React Testing Library** | Reducer logic tested hard; component behavior tested for interactions. |
| Tooling | ESLint + Prettier, **GitHub Actions CI**, **deployed demo** | Production hygiene signals. |
| Font | **Poppins** (Google Fonts) | Matches the rounded-geometric mockup type. |

---

## 2. Project structure

```
bundle-builder/
├─ src/
│  ├─ app/                 # App shell, providers, ErrorBoundary, Suspense, "Let's get started!" H1
│  ├─ features/
│  │  ├─ builder/          # Accordion, Step, ProductCard, VariantSelector, NextButton
│  │  └─ review/           # ReviewPanel, ReviewLine, GuaranteeBlock, Totals, Checkout
│  ├─ state/               # reducer, contexts, selector hooks, persistence
│  ├─ shared/ui/           # design-system primitives (Button, Price, QuantityStepper, …)
│  ├─ lib/                 # money formatting, zod schema, types, data loader
│  └─ data/                # bundle.json (seed source of truth)
├─ server/                 # Express + Zod API (bonus)
├─ .github/workflows/      # CI: typecheck → lint → test → build
└─ README.md
```

**Principle:** *feature-folder* architecture. `builder/` and `review/` own their UI;
`shared/ui/` holds the design system; `state/` is the single brain; `lib/` is pure utilities.
Dependencies point inward (features → shared/state/lib), never sideways between features.

---

## 3. State management — Context + `useReducer`, done the way that beats a library

The most-scrutinized part of the build. The hard requirement is **variant-scoped quantities
synced bidirectionally** between the product cards and the review panel. We chose pure React
deliberately, and engineered around its one weakness (re-render fan-out).

### 3.1 Normalized state shape

```ts
type BundleState = {
  productsById: Record<ProductId, {
    selectedVariantId: VariantId;          // which variant the card stepper is bound to
    variants: Record<VariantId, { qty: number }>;  // each variant tracks its OWN qty
  }>;
};
```

This shape is the key to the whole feature:
- **Red and Blue are separate keys** → independent counts, for free.
- The card stepper reads/writes `variants[selectedVariantId].qty`. Selecting a color just
  changes `selectedVariantId`; the stepper instantly reflects that variant's count.
- The review panel is a **derived projection**: flatten every `variants[*]` with `qty > 0`
  into lines, grouped by category. Switching the card's active color never removes a
  previously-added variant from the review — because the review reads *all* variants, not the
  active one.

### 3.2 Reducer (pure, fully unit-testable without React)

```
SELECT_VARIANT   { productId, variantId }
SET_QTY          { productId, variantId, qty }     // clamped ≥ 0 (or ≥ min for "Required")
INCREMENT / DECREMENT { productId, variantId }
HYDRATE          { state }                          // restore from localStorage
RESET
```

Because the reducer is a pure function, the trickiest business rules are tested in isolation
(no DOM, no mocks) — e.g. *"add 2 Red, switch to Blue → stepper reads 0, review still shows
Red ×2."*

### 3.3 Beating the Context re-render problem

Naive Context re-renders every consumer on any change. With ~30 steppers/cards/lines that's
sluggish. Three mitigations:

1. **Split contexts** — `BundleStateContext` (value) and `BundleDispatchContext` (stable
   `dispatch`). Components that only *dispatch* (e.g. a stepper button) subscribe to dispatch
   only and never re-render on state changes.
2. **Narrow selector hooks** — `useVariantQuantity(productId)` returns just that product's
   slice via `useMemo`; the card is wrapped in `React.memo`, so it re-renders only when *its*
   data changes.
3. **Memoized derivations** — `useReviewLines()` and `useBundleTotals()` compute with `useMemo`,
   so totals/lines aren't recomputed on unrelated renders.

This is *the* talking point: the "no library" choice becomes a demonstration of understanding
React's render model rather than outsourcing it. (If scope grew — multi-bundle, server cart,
undo/redo — Zustand's selectors + `persist` middleware would be the upgrade path.)

### 3.4 Custom hooks (the public API of the store)

| Hook | Responsibility |
|---|---|
| `useBundleState()` / `useBundleDispatch()` | Raw access to split contexts |
| `useVariantQuantity(productId)` | Binds a card's stepper to its active variant |
| `useStepSelectionCount(stepId)` | "N selected" — distinct products with qty > 0 in a step |
| `useReviewLines()` | Derives grouped review lines (qty > 0), in fixed group order |
| `useBundleTotals()` | Memoized price math: subtotal, compare-at, savings, total |
| `usePersistedReducer()` | `useReducer` wrapper: hydrate from localStorage → save on change |

---

## 4. Pricing model (the documented Figma fix)

The mockup's card unit prices don't reconcile with its review line totals (Pan v3: $34.98/unit
card vs $47.98 for qty 2 in review). We can't ship two contradictory price sources behind a
"live total."

**Decision: the card unit price is the single source of truth.** Each variant carries
`price` + `compareAt` (unit values). Review line = `unit × qty`; grand total = Σ lines (+ plan;
shipping free). Consequence at the seeded state:

- Active total computes to **$209.87** (mockup printed $187.89)
- Compare-at total **$260.79**, savings **$50.92** — *the savings matches the mockup exactly*.

Only the Pan v3 line and the grand total differ from the printed mockup; this is documented in
the README as a deliberate correctness fix, not an oversight.

---

## 5. Data layer — JSON + Zod (one source of truth for types)

`src/data/bundle.json` defines steps → products → variants → prices → seed quantities. A Zod
schema in `lib/schema.ts` validates it at load time **and** the TS types are *inferred* from
the schema (`z.infer<typeof BundleSchema>`) — so the data, runtime validation, and static types
can never drift apart. Invalid data fails loudly with a friendly fallback rather than rendering
a broken UI.

Example (abbreviated):

```ts
const Variant = z.object({ id: z.string(), label: z.string(), swatch: z.string(),
  price: z.number(), compareAt: z.number().nullable() });
const Product = z.object({ id: z.string(), title: z.string(), description: z.string(),
  badge: z.string().nullable(), image: z.string(), category: Category,
  variants: z.array(Variant), required: z.boolean().default(false),
  hasStepper: z.boolean().default(true), seedQty: z.record(z.number()).default({}) });
export type Product = z.infer<typeof Product>;
```

---

## 6. UI & design system

### 6.1 Token tiers (Tailwind v4 `@theme`)
1. **Primitive tokens** — raw palette as CSS vars (`--color-brand: #4e2fd2`).
2. **Semantic tokens** — intent-named (`--color-price-active`, `--color-strike-sale`).
   Components reference *only* these.
3. **Tailwind utilities** — `@theme` exposes them as `text-brand`, `bg-surface`, etc.

| Token | Hex | Role |
|---|---|---|
| brand | `#4e2fd2` | buttons, active price, selected ring, badges, total, FREE, seal |
| surface | `#edf4ff` | expanded-step / review-panel background |
| ink | `#1f1f1f` | headings, titles |
| body | `#575757` | descriptions, secondary text, **review strike** |
| muted | `#484848` | "Save my system for later" |
| step-plus / step-minus | `#f0f4f7` / `#e6ebf0` | stepper button backgrounds |
| step-icon | `#525963` | +/− glyphs (disabled = reduced opacity) |
| link | `#0000ee` | "Learn More" |
| success | `#0aa288` | savings callout |
| danger | `#d8392b` | **card strike** price |

Radii exposed as `--radius-card` (~16px), `--radius-control` (~8–10px), `--radius-pill` (full).

### 6.2 Shared primitives (`shared/ui/`) — each memoized + tested
`Button`, `Badge`, `Price` (`tone="sale" | "muted"` → red on cards, gray in review),
`QuantityStepper` (supports `disabled`/min for the "Required" Hub), `VariantChip`,
`Chevron`, `Thumbnail`, `Pill`, `GuaranteeSeal`, `SectionLabel`.

`<Price>` deserves note: one component renders the struck compare-at + active pair, and the
`tone` prop is exactly how we honor the card-red / review-gray distinction without duplicating
markup.

### 6.3 Builder (`features/builder/`)
- **Accordion / Step:** headers are real `<button>`s with `aria-expanded` + `aria-controls`;
  Step 1 open on load; one open at a time. "STEP X OF 4" eyebrow, icon, title, and the
  right-side indicator (open → "N selected" + up-chevron; collapsed → down-chevron).
- **ProductCard:** data-driven — optional badge, image, title, description, "Learn More",
  optional `VariantSelector`, `QuantityStepper`, `Price`. `qty > 0` → selected state (brand
  ring). Not every product has every element (doorbell has no variants/badge); the component
  renders only what the data provides.
- **Lazy loading:** each step's panel is `React.lazy` + `Suspense`, code-splitting steps 2–4.

### 6.4 Review (`features/review/`)
`ReviewPanel` renders grouped `ReviewLine`s (Cameras → Sensors → Accessories → Plan), each with
thumbnail, name, its own (synced) stepper, and `Price`. Below: shipping row, guarantee block
(the "30-day hassle-free returns" text shows in the wide layout), financing pill, total with
struck compare-at, savings callout, Checkout (placeholder confirmation), and the
Save-for-later link.

---

## 7. Responsive strategy

Primary layout per the brief ("a review panel *beside* it"):
- **Desktop (≥1024px):** two columns — builder left (~62%), review as a **sticky right rail**.
- **Wide:** the card grid expands toward a 5-across vertical-card layout; the review can use its
  wider internal 2-col arrangement (line items | summary) with the returns text visible.
- **Mobile (<640px):** single column — "Let's get started!" H1, full accordion (counts shown on
  every step), review stacked full-width below with larger thumbnails.

The card grid (CSS grid auto-fit / breakpoint columns) is the responsive primitive; cards
reflow image-top vs image-left based on available width. Verified usable down to ~360px.

---

## 8. Server (bonus) — Express + Zod

A small typed Express server exposes `GET /api/bundle`, returning the **same Zod-validated**
JSON. The client fetches from it with a graceful fallback to the bundled local JSON if the
server is unreachable — so the app runs from a clean clone with or without the server. Sharing
the Zod schema between client and server guarantees the contract.

---

## 9. Error handling & resilience

- **Error Boundary** at the app shell catches render errors and shows a recovery UI.
- **Suspense fallbacks** for lazily-loaded steps.
- **Zod parse guards** on data load → friendly fallback instead of a white screen.
- **Stepper guards** — quantities clamped (≥ 0, or ≥ min for "Required" items); the Hub's
  decrement is disabled at 1.
- **Persistence is defensive** — corrupt/old localStorage is caught and falls back to the seed.

---

## 10. Performance & optimization

- Split contexts + `React.memo` + narrow selector hooks (see §3.3).
- `useMemo` for derived lines/totals; `useCallback` for stable dispatch handlers.
- `React.lazy` step code-splitting.
- Tailwind's JIT keeps CSS minimal; Poppins loaded with `display: swap`.
- Images sized/lazy-loaded to avoid layout shift.

---

## 11. Testing

- **Reducer (unit):** the variant-quantity invariants (the "add 2 Red → switch to Blue"
  scenario), total/savings math, clamping, "Required" min, HYDRATE round-trip.
- **Selectors/hooks:** `useStepSelectionCount`, `useReviewLines`, `useBundleTotals`.
- **Components (RTL):** stepper sync between card and review, accordion open/close + a11y
  attributes, variant selection flows through to the review, persistence save → reload restore.
- **CI** runs typecheck → lint → test → build on every push.

---

## 12. Persistence flow ("Save my system for later")

`usePersistedReducer` hydrates initial state from `localStorage` (falling back to the seeded
JSON), and writes on change (debounced); the **Save my system for later** link triggers an
explicit persist + confirmation. Result: configure → save → leave → return → restored exactly.
The stored shape is the normalized state, versioned so future schema changes can migrate safely.

---

## 13. Definition of done

Clean clone → `npm install` → `npm run dev` boots the app looking exactly like the design;
`npm run server` serves the API; `npm test` is green; CI passes; a live demo URL is in the
README; README documents decisions, the pricing-model fix, tradeoffs, and next steps.
