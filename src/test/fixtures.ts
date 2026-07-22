import type { PokemonInsightResult } from '../../api/tools/get-pokemon-insight';

export const pikachuInsight: PokemonInsightResult = {
  id: 25,
  name: 'pikachu',
  image: 'https://example.com/pikachu.png',
  types: ['electric'],
  heightMeters: 0.4,
  weightKg: 6,
  baseExperience: 112,
  totalStats: 320,
  strongestStat: { name: 'speed', value: 90 },
  stats: [
    { name: 'hp', value: 35 },
    { name: 'attack', value: 55 },
    { name: 'defense', value: 40 },
    { name: 'special-attack', value: 50 },
    { name: 'special-defense', value: 50 },
    { name: 'speed', value: 90 },
  ],
};
