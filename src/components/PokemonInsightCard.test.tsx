import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { pikachuInsight } from '../test/fixtures';
import { PokemonInsightCard } from './PokemonInsightCard';

describe('PokemonInsightCard', () => {
  it('presents identity, artwork, and core metrics', () => {
    render(<PokemonInsightCard result={pikachuInsight} />);
    expect(screen.getByRole('img', { name: 'pikachu ilustración oficial' })).toBeInTheDocument();
    expect(screen.getByText('320')).toBeInTheDocument();
    expect(screen.getByText('0.4 m')).toBeInTheDocument();
  });

  it('caps oversized stat bars while preserving the value', () => {
    const result = { ...pikachuInsight, stats: [{ name: 'attack', value: 255 }] };
    render(<PokemonInsightCard result={result} />);
    expect(screen.getByText('255')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Estadísticas base').querySelector('[style="width: 100%;"]'),
    ).toBeTruthy();
  });
});
