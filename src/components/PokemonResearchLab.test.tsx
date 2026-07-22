import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PokemonResearchLab } from './PokemonResearchLab';

const sendMessage = vi.fn();

vi.mock('@ai-sdk/react', () => ({
  useChat: () => ({
    messages: [],
    sendMessage,
    regenerate: vi.fn(),
    status: 'ready',
    error: undefined,
    clearError: vi.fn(),
  }),
}));

describe('PokemonResearchLab form', () => {
  beforeEach(() => sendMessage.mockClear());

  it('blocks empty input and explains how to continue', async () => {
    render(<PokemonResearchLab />);
    const input = screen.getByRole('textbox', { name: /Pokémon to research/i });
    await userEvent.clear(input);
    expect(screen.getByRole('button', { name: 'Run tool' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Enter a Pokémon name or number');
  });

  it('submits a trimmed validated request through the mocked chat route', async () => {
    render(<PokemonResearchLab />);
    const input = screen.getByRole('textbox', { name: /Pokémon to research/i });
    await userEvent.clear(input);
    await userEvent.type(input, '  eevee  ');
    await userEvent.click(screen.getByRole('button', { name: 'Run tool' }));
    expect(sendMessage).toHaveBeenCalledWith(
      { text: 'Research eevee and build its battle profile.' },
      { body: { sabotage: 'none' } },
    );
  });
});
