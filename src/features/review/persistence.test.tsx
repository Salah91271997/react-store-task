import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStore } from '@/test/utils';
import { Accordion } from '@/features/builder';
import { ReviewPanel } from './ReviewPanel';

const ui = (
  <>
    <Accordion />
    <ReviewPanel />
  </>
);

describe('Save my system for later → restored on return', () => {
  it('persists the configuration and restores it on a fresh mount', async () => {
    const user = userEvent.setup();
    const first = renderWithStore(ui);

    const card = await screen.findByRole('article', { name: 'Wyze Cam v4' });
    await user.click(within(card).getByRole('button', { name: 'Increase quantity' }));
    await user.click(screen.getByRole('button', { name: /Save my system for later/i }));

    first.unmount();

    renderWithStore(ui);
    const restoredCard = await screen.findByRole('article', { name: 'Wyze Cam v4' });
    const stepper = within(restoredCard).getByRole('group', { name: /Quantity of Wyze Cam v4/i });
    expect(within(stepper).getByText('2')).toBeInTheDocument();
  });
});
