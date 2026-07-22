import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { pikachuInsight } from '../test/fixtures';
import { ToolPartRenderer, type InsightToolPart } from './ToolPartRenderer';

const callbacks = {
  onRecover: vi.fn(),
  onResearchPikachu: vi.fn(),
  onPrefillGengar: vi.fn(),
};

function part(state: InsightToolPart['state']): InsightToolPart {
  return { type: 'tool-getPokemonInsight', toolCallId: 'tool-1', state, input: { name: 'pikachu' } };
}

describe('ToolPartRenderer', () => {
  it('renders an actionable first-run empty state', async () => {
    render(<ToolPartRenderer {...callbacks} />);
    await userEvent.click(screen.getByRole('button', { name: 'Research Pikachu' }));
    expect(callbacks.onResearchPikachu).toHaveBeenCalledOnce();
  });

  it('announces streaming tool input as pending', () => {
    render(<ToolPartRenderer {...callbacks} part={part('input-streaming')} />);
    expect(screen.getByRole('status')).toHaveTextContent('streaming tool input');
  });

  it('shows the validated input while the tool executes', () => {
    render(<ToolPartRenderer {...callbacks} part={part('input-available')} />);
    expect(screen.getByLabelText('Building pikachu profile')).toBeInTheDocument();
  });

  it('renders structured output as an accessible result card', () => {
    render(<ToolPartRenderer {...callbacks} part={{ ...part('output-available'), output: pikachuInsight }} />);
    expect(screen.getByRole('heading', { name: 'pikachu' })).toBeInTheDocument();
    expect(screen.getByLabelText('Base stats chart')).toHaveTextContent('Speed90');
  });

  it('renders a designed error and provides recovery', async () => {
    render(<ToolPartRenderer {...callbacks} part={{ ...part('output-error'), errorText: 'Malformed response' }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Malformed response');
    await userEvent.click(screen.getByRole('button', { name: 'Recover with Pikachu' }));
    expect(callbacks.onRecover).toHaveBeenCalledOnce();
  });
});
