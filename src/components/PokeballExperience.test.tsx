import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PokeballExperience } from './PokeballExperience';

class IntersectionObserverStub {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

describe('PokeballExperience', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
  });

  it('uses a static fallback when reduced motion is preferred', () => {
    render(<PokeballExperience />);
    expect(screen.getByRole('img', { name: /Static Poké Ball preview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open Poké Ball' })).toBeDisabled();
  });

  it('lets users change the finish in fallback mode', async () => {
    render(<PokeballExperience />);
    const violet = screen.getByRole('button', { name: 'Use Master violet' });
    await userEvent.click(violet);
    expect(violet).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Use Classic red' })).toHaveAttribute('aria-pressed', 'false');
  });
});
