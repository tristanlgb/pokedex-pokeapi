import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PokemonResearchLab } from './PokemonResearchLab';

const chatMock = vi.hoisted(() => ({
  sendMessage: vi.fn(),
  stop: vi.fn(),
  status: 'ready',
}));

vi.mock('@ai-sdk/react', () => ({
  useChat: () => ({
    messages: [],
    sendMessage: chatMock.sendMessage,
    regenerate: vi.fn(),
    status: chatMock.status,
    error: undefined,
    clearError: vi.fn(),
    stop: chatMock.stop,
  }),
}));

describe('PokemonResearchLab form', () => {
  beforeEach(() => {
    chatMock.sendMessage.mockClear();
    chatMock.stop.mockClear();
    chatMock.status = 'ready';
  });

  it('blocks empty input and explains how to continue', async () => {
    render(<PokemonResearchLab />);
    const input = screen.getByRole('textbox', { name: /Pokémon para investigar/i });
    await userEvent.clear(input);
    expect(screen.getByRole('button', { name: 'Investigar' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Ingresa un nombre o número de Pokémon');
  });

  it('submits a trimmed validated request through the mocked chat route', async () => {
    render(<PokemonResearchLab />);
    const input = screen.getByRole('textbox', { name: /Pokémon para investigar/i });
    await userEvent.clear(input);
    await userEvent.type(input, '  eevee  ');
    await userEvent.click(screen.getByRole('button', { name: 'Investigar' }));
    expect(chatMock.sendMessage).toHaveBeenCalledWith(
      { text: 'Research eevee and build its battle profile.' },
      { body: { sabotage: 'none' } },
    );
  });

  it('exposes a focused stop action while the AI response is streaming', async () => {
    chatMock.status = 'streaming';
    render(<PokemonResearchLab />);
    const stopButton = screen.getByRole('button', { name: 'Detener investigación' });
    expect(stopButton).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(chatMock.stop).toHaveBeenCalledOnce();
  });
});
