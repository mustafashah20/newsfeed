import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/services/news/http';

import { SourceStatusBar } from './SourceStatusBar';

const error = (code: ApiError['code'], provider: ApiError['provider']) =>
  new ApiError({ status: 0, code, provider, message: 'raw' });

describe('SourceStatusBar', () => {
  it('shows a friendly chip per failed source with a working Retry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <SourceStatusBar
        onRetry={onRetry}
        sources={[
          { provider: 'guardian', label: 'The Guardian', status: 'success' },
          {
            provider: 'nyt',
            label: 'The New York Times',
            status: 'error',
            error: error('rate_limited', 'nyt'),
          },
        ]}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The New York Times rate limit reached. Try again in a minute',
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledWith('nyt');
  });

  it('offers no Retry for a source without a key', () => {
    render(
      <SourceStatusBar
        onRetry={vi.fn()}
        sources={[
          {
            provider: 'newsapi',
            label: 'NewsAPI',
            status: 'error',
            error: error('not_configured', 'newsapi'),
          },
        ]}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent("NewsAPI isn't configured");
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  });

  it('renders nothing when no source failed', () => {
    const { container } = render(
      <SourceStatusBar
        onRetry={vi.fn()}
        sources={[{ provider: 'guardian', label: 'The Guardian', status: 'loading' }]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
