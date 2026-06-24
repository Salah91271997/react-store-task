# Business Insights — Bundle Builder

> Context: a frontend take-home for **Ecom Experts (Shopify Plus agency)**. This document
> frames *why* the product is built the way it is — the commercial reasoning behind the UI,
> so the build reads as the work of someone who understands conversion, not just code.

---

## 1. What this product actually is

It's a **guided bundle builder** for a home-security system (Wyze hardware). The shopper
assembles a multi-part system — cameras, a plan, sensors, accessories — through a 4-step
flow, while a live **review panel** ("Your security system") continuously reflects and
prices their configuration.

This is a classic **high-AOV (Average Order Value) configurator** pattern. The whole UX is
engineered to do one thing: move the shopper from "I want a camera" to "I want a *system*",
and to make checking out feel like the natural conclusion of a decision they've already made.

---

## 2. The conversion levers baked into the design

Every visual choice in the Figma maps to a known e-commerce persuasion principle. Naming
them shows the agency we understand the *intent* behind the pixels:

| Design element | Business lever | Why it works |
|---|---|---|
| **Step 1 pre-expanded + items pre-seeded** | Anchoring / default bias | The shopper starts from a *populated* cart, not an empty one. The default is "buy a system," and people tend to keep defaults. |
| **"Save 22%" badges + struck-through prices** | Loss-aversion / reference pricing | A red crossed-out price makes the discount feel concrete and urgent. |
| **Live total + "You're saving $50.92"** | Real-time reinforcement | Every quantity change re-renders the savings — the shopper *sees* value accrue as they build. |
| **"Sense Hub (Required) — FREE"** | Value framing | A mandatory component is reframed as a free gift, not a forced add-on. |
| **Fast Shipping → FREE** | Friction removal | Shipping cost is the #1 cart-abandonment trigger; showing it struck-to-free removes the objection pre-emptively. |
| **"as low as $19.19/mo" financing** | Price partitioning | Splitting $187.89 into a monthly figure lowers the perceived purchase barrier. |
| **100% satisfaction guarantee + "30-day hassle-free returns"** | Risk reversal | Removes the "what if I don't like it" hesitation at the exact moment of decision. |
| **"Save my system for later"** | Re-engagement / abandoned-cart recovery | Captures intent even when the shopper isn't ready, enabling a return visit to convert. |
| **Grouped review panel (Cameras / Sensors / Plan)** | Mental accounting | Organizing the order into a "system" makes a $200 spend feel like a coherent purchase, not a pile of SKUs. |

---

## 3. Who the shopper is (and what the UX assumes about them)

- **Considered purchase, not impulse.** Home security is researched. The accordion respects
  that — it paces the decision into digestible steps rather than dumping a 20-SKU grid.
- **Mixed technical confidence.** "Learn More" links and plain-language descriptions
  ("360° pan and 180° tilt") lower the knowledge barrier for non-experts.
- **Price-sensitive but value-driven.** The relentless compare-at pricing and the savings
  callout suggest a shopper who needs to feel they got a deal to commit.
- **Multi-session.** "Save my system for later" assumes the purchase may span visits —
  realistic for a $200+ basket.

---

## 4. Why "Save my system for later" is the most commercially important feature

It's easy to dismiss as a checkbox requirement, but it's the highest-leverage piece of the
brief:

- A configured-but-not-purchased bundle is a **warm lead**. Persisting it means the shopper
  can leave, think, and return to a ready-to-buy cart — collapsing the friction of a return
  visit to near zero.
- In production this is the hook for **abandoned-cart email/SMS flows** (a core Shopify Plus
  revenue channel). Our localStorage implementation is the client-side half of that loop; the
  natural next step is syncing it to a customer account for cross-device recovery.
- It signals to the agency that we see the **post-click lifecycle**, not just the first session.

---

## 5. Why the engineering choices serve the business

The technical decisions (detailed in `02_TECHNICAL_IMPLEMENTATION.md`) are not gold-plating —
each maps to a commercial outcome:

| Engineering choice | Business payoff |
|---|---|
| **Live, always-correct total recalculation** | Pricing trust. A configurator that mis-totals destroys conversion instantly. |
| **Variant-scoped quantities (Red ≠ Blue)** | Accurate carts → fewer post-purchase support tickets and returns. |
| **Performance / memoization** | A snappy builder keeps the shopper in flow; lag during configuration is abandonment. |
| **Accessibility (keyboard + ARIA)** | Wider addressable market + ADA/legal risk reduction — a real concern for agency clients. |
| **Responsive down to phone** | Mobile is the majority of Shopify traffic; an unusable mobile builder forfeits most revenue. |
| **Persistence** | Abandoned-cart recovery (see §4). |

---

## 6. The one judgment call worth highlighting to the client

The Figma's printed numbers are **internally inconsistent**: a product card's unit price
doesn't multiply up to its line total in the review panel (e.g. Wyze Cam Pan v3 shows
$34.98/unit on the card but $47.98 for qty 2 in the review — implying $23.99/unit).

In a real store this is a **pricing-integrity bug** — the kind that erodes trust and triggers
chargebacks. Rather than hardcode the mismatched mockup numbers, we chose a **single source of
truth** (the card unit price) and compute every line and total from it, so the math is always
correct and auditable. Notably, the headline **savings figure ($50.92) still matches the
mockup exactly**. This is the difference between "pixel-copying a design" and "shipping a
storefront a merchant can trust."
