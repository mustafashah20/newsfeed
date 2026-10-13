import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DateRangeFilter } from './DateRangeFilter';

const NOW = new Date(2026, 9, 14, 15); // 14 Oct 2026

function renderFilter(props: { from?: string; to?: string } = {}) {
  const onChange = vi.fn();
  render(
    <>
      <label htmlFor="date">Date</label>
      <DateRangeFilter id="date" onChange={onChange} now={NOW} {...props} />
    </>,
  );
  return { onChange, user: userEvent.setup() };
}

describe('DateRangeFilter', () => {
  it('reflects the applied preset and switches to another', async () => {
    const { onChange, user } = renderFilter({ from: '2026-10-07' });

    expect(screen.getByRole('combobox', { name: 'Date' })).toHaveTextContent('Past week');
    await user.click(screen.getByRole('combobox', { name: 'Date' }));
    await user.click(await screen.findByRole('option', { name: 'Past 24 hours' }));

    expect(onChange).toHaveBeenCalledWith({ from: '2026-10-13' });
  });

  it('picks a custom range in the calendar and applies it', async () => {
    const { onChange, user } = renderFilter();

    await user.click(screen.getByRole('combobox', { name: 'Date' }));
    await user.click(await screen.findByRole('option', { name: 'Custom range…' }));
    await user.click(await screen.findByRole('button', { name: 'Pick dates' }));
    const apply = await screen.findByRole('button', { name: 'Apply' });
    expect(apply).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /October 1st, 2026/ }));
    await user.click(screen.getByRole('button', { name: /October 10th, 2026/ }));
    await user.click(apply);

    expect(onChange).toHaveBeenCalledWith({ from: '2026-10-01', to: '2026-10-10' });
  });

  it('shows an applied custom range and doesn’t allow future days', async () => {
    const { user } = renderFilter({ from: '2026-10-01', to: '2026-10-10' });

    const trigger = screen.getByRole('button', { name: '1 Oct 2026 – 10 Oct 2026' });
    await user.click(trigger);

    expect(await screen.findByRole('button', { name: /October 20th, 2026/ })).toBeDisabled();
  });
});
