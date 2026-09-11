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
    expect(screen.getByRole('img', { name: /Vista estática de Poké Ball/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir Poké Ball' })).toBeDisabled();
  });

  it('lets users change the finish in fallback mode', async () => {
    render(<PokeballExperience />);
    const violet = screen.getByRole('button', { name: 'Usar Violeta maestro' });
    await userEvent.click(violet);
    expect(violet).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Usar Rojo clásico' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
