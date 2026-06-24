import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStore } from '@/test/utils';
import { Accordion } from './Accordion';
import { ReviewPanel } from '@/features/review';

function renderBuilder() {
  return renderWithStore(
    <>
      <Accordion />
      <ReviewPanel />
    </>
  );
}

describe('accordion accessibility', () => {
  it('opens Step 1 on load and exposes correct ARIA', async () => {
    renderBuilder();

    const camerasHeader = screen.getByRole('button', { name: /Step 1 of 4/i });
    expect(camerasHeader).toHaveAttribute('aria-expanded', 'true');

    const planHeader = screen.getByRole('button', { name: /Step 2 of 4/i });
    expect(planHeader).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles a step when its header is clicked', async () => {
    const user = userEvent.setup();
    renderBuilder();
    const planHeader = screen.getByRole('button', { name: /Step 2 of 4/i });
    await user.click(planHeader);
    expect(planHeader).toHaveAttribute('aria-expanded', 'true');

    expect(screen.getByRole('button', { name: /Step 1 of 4/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });
});

describe('stepper sync between card and review', () => {
  it('incrementing on the card updates the review line (and vice versa)', async () => {
    const user = userEvent.setup();
    renderBuilder();

    const card = await screen.findByRole('article', { name: 'Wyze Cam v4' });
    const cardStepper = within(card).getByRole('group', { name: /Quantity of Wyze Cam v4/i });
    expect(within(cardStepper).getByText('1')).toBeInTheDocument();

    await user.click(within(cardStepper).getByRole('button', { name: 'Increase quantity' }));

    const steppers = screen.getAllByRole('group', { name: /Quantity of Wyze Cam v4/i });
    expect(steppers).toHaveLength(2);
    for (const s of steppers) expect(within(s).getByText('2')).toBeInTheDocument();
  });
});

describe('variant-scoped quantities flow to the review', () => {
  it('switching the card to a 0-qty variant shows 0, but the added variant stays in the review', async () => {
    const user = userEvent.setup();
    renderBuilder();

    const card = await screen.findByRole('article', { name: 'Wyze Cam v4' });

    await user.click(within(card).getByRole('button', { name: 'Black' }));

    const cardStepper = within(card).getByRole('group', { name: /Quantity of Wyze Cam v4/i });
    expect(within(cardStepper).getByText('0')).toBeInTheDocument();

    const review = screen.getByRole('complementary', { name: /Your security system/i });
    const reviewStepper = within(review).getByRole('group', { name: /Quantity of Wyze Cam v4/i });
    expect(within(reviewStepper).getByText('1')).toBeInTheDocument();
  });
});

describe('Required item stepper', () => {
  it('disables the decrement on the Sense Hub at its minimum', async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(screen.getByRole('button', { name: /Step 3 of 4/i }));

    const hubCard = await screen.findByRole('article', { name: 'Wyze Sense Hub' });
    const stepper = within(hubCard).getByRole('group', { name: /Quantity of Wyze Sense Hub/i });
    expect(within(stepper).getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
  });
});
