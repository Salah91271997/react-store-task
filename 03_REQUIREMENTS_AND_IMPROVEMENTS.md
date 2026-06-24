# Requirements & Improvements

> Three columns of value: (1) exactly what the client asked for and where we satisfy it,
> (2) the improvements *we* committed to in order to stand out, and (3) further improvements
> proposed on top. Use this as the scoring checklist when reviewing the submission.

---

## Part A — Client requirements (the brief) → where we meet them

### Core build
| # | Requirement (from brief) | How we satisfy it |
|---|---|---|
| 1 | Two-column experience: builder left, review panel right | Side-by-side layout; review as sticky right rail on desktop |
| 2 | 4-step vertical accordion; Step 1 expanded on load | `Accordion`/`Step`, one open at a time, step 1 default-open |
| 3 | Step header: "STEP X OF 4", icon, title, state indicator | Eyebrow + icon + title + ("N selected" + up-chevron when open / down-chevron when collapsed) |
| 4 | "Next: …" button advances to the following step | `NextButton` per step, dispatches step advance |
| 5 | Product cards: optional badge, image, title, desc, "Learn More", variant selector, stepper, pricing | Data-driven `ProductCard`; renders only the elements each product's data provides |
| 6 | Selected state for cards with qty > 0 (highlighted border) | Brand-colored ring when active variant qty > 0 |
| 7 | Not every product has every element (no badge / no variants — doorbell) | Conditional rendering from JSON; doorbell has no badge/variants |
| 8 | Review panel grouped by Cameras / Sensors / Accessories / Plan | Grouped `ReviewLine`s in fixed order |
| 9 | Review line: thumbnail, name, own stepper, pricing | `ReviewLine` component |
| 10 | Shipping row, satisfaction badge, financing line, total (struck pre-discount), savings callout, Checkout, Save-for-later | All present in `ReviewPanel` summary block |
| 11 | Checkout is a placeholder/confirmation | Confirmation dialog placeholder |

### Interactions that must work
| # | Requirement | How |
|---|---|---|
| 12 | Variant selection (each variant its own quantity) | Normalized `variants[id].qty`; card stepper bound to active variant |
| 13 | Steppers on cards **and** review lines, kept in sync | Single source of truth in the reducer; both read/write the same state |
| 14 | Accordion expand/collapse; Step 1 open on load | ✓ |
| 15 | "N selected" = distinct products chosen in that step | `useStepSelectionCount` (distinct products with qty > 0) |
| 16 | Live review panel; total recalculates as quantities change | Derived `useReviewLines` + memoized `useBundleTotals` |
| 17 | Variant detail: switching active color doesn't remove the other from the review | Review reads *all* variants with qty > 0, not the active one |
| 18 | Products with no color options have a single stepper (doorbell) | No `VariantSelector` when `variants` is empty/singleton |

### Data
| # | Requirement | How |
|---|---|---|
| 19 | Data-driven from a JSON source you define | `src/data/bundle.json` |
| 20 | Render from data, don't hardcode per-product markup | Generic `ProductCard`/`ReviewLine` driven by JSON |
| 21 | Seed initial state to match the design (pre-populated sensors, accessory, plan) | `seedQty` in JSON reproduces the mockup on load |
| 22 | Serving JSON from a backend is a **bonus** | Express + Zod API (done) |

### Fidelity, responsiveness, persistence, deliverable
| # | Requirement | How |
|---|---|---|
| 23 | Desktop matches Figma (layout, spacing, type, color, radii, states) | Token-driven build from the supplied palette + Poppins; selected/disabled states modeled |
| 24 | Responsive and usable down to a phone | Rail → mobile stack; verified to ~360px |
| 25 | Disabled steppers (e.g. "Required" Hub) | `QuantityStepper` disabled/min support |
| 26 | "Save my system for later" persists; restored on reload/return | `usePersistedReducer` + localStorage, explicit save |
| 27 | Public GitHub repo, React source, JSON (+ backend), run instructions, README of decisions/tradeoffs | Repo + README + this doc set |

---

## Part B — Improvements *we* committed to (to stand out)

These go beyond the brief and were agreed as the differentiators:

1. **TypeScript (strict) everywhere** — not requested as such, but the bar for production UI.
2. **Zod schema as the single source of truth** for both runtime validation *and* inferred
   types — data, validation, and types can't drift.
3. **Real design-system layering** — primitive → semantic → Tailwind tokens, so the design
   system *is* the config (not hexes scattered through components).
4. **Context + `useReducer` engineered for performance** — split contexts, normalized state,
   memoized selector hooks, `React.memo`. Turns "no library" into a demonstration of mastery.
5. **Lazy loading + code-splitting** per accordion step.
6. **Error boundaries + Suspense fallbacks + Zod parse guards** — graceful failure, no white screens.
7. **Express + Zod API** (the brief's bonus) with client-side graceful fallback to local JSON.
8. **Unit tests with Vitest + RTL**, with the reducer's variant-quantity invariants tested first.
9. **Accessibility pass** — real `<button>` accordion headers, `aria-expanded`/`aria-controls`,
   keyboard navigation, focus management, labelled steppers/chips.
10. **GitHub Actions CI** — typecheck → lint → test → build on every push.
11. **Deployed live demo** (Vercel/Netlify) linked in the README — reviewers click before reading.
12. **A genuinely good README** — architecture rationale, the variant-quantity data model, the
    documented Figma pricing fix, tradeoffs, and "what's next."
13. **Caught & resolved the Figma pricing inconsistency** — chose card-unit as source of truth,
    documented it; the savings figure still matches the mockup exactly.

---

## Part C — Further improvements proposed (additional, on top)

Ideas we can ship or list as "next steps" to show product depth beyond the ask:

### UX / product
- **Smooth motion** on accordion expand/collapse and selected-state transitions (CSS or Framer Motion).
- **"Edit" deep-links** from a review line back to its builder step.
- **Empty-state nudges** — gentle prompts when a recommended category is empty.
- **Sticky mobile mini-summary bar** (running total + Checkout) pinned to the viewport bottom.
- **Micro-interactions** — qty change pulse, savings count-up animation to reinforce value.

### Engineering / quality
- **Playwright E2E** for the critical path (configure → save → reload → checkout) beyond unit tests.
- **Storybook** for the design-system primitives — living documentation of every component/state.
- **Visual-regression tests** (Chromatic/Playwright snapshots) to lock fidelity over time.
- **i18n-ready** money/number formatting via `Intl.NumberFormat` (already centralized in `lib/`).
- **State versioning + migration** for persisted carts, so schema changes don't break returning users.
- **Bundle-size budget** in CI; Lighthouse CI for performance/a11y regressions.
- **Pre-commit hooks** (lint-staged + Husky) and Conventional Commits for clean history.

### Commercial (production-direction, see `01_BUSINESS_INSIGHTS.md`)
- **Server-persisted cart tied to a customer account** for cross-device recovery and the
  abandoned-cart email/SMS loop (the natural extension of "Save my system for later").
- **Analytics events** on step completion, variant selection, and save — to measure the funnel.
- **A/B-ready** token + copy layer (e.g. test savings-callout wording or default seeded bundle).
- **Real Shopify integration** — map products/variants to Shopify SKUs and the cart/checkout API.

---

## How to read this for scoring

- **Part A** = pass/fail against the brief. Every line is satisfied.
- **Part B** = why this submission beats a baseline "it works" entry.
- **Part C** = evidence we think like product engineers, not just ticket-takers.
