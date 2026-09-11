import { describe, expect, it } from 'vitest';
import { defensiveMultiplier } from './CollectionViews';
import type { PokemonTypeResponse } from '../types';
function relations(double: string[], half: string[], none: string[]): PokemonTypeResponse {
  const resources = (names: string[]) => names.map((name) => ({ name, url: '' }));
  return {
    pokemon: [],
    damage_relations: {
      double_damage_from: resources(double),
      half_damage_from: resources(half),
      no_damage_from: resources(none),
    },
  };
}
describe('dual-type defensive coverage', () => {
  it('multiplies weaknesses and resistances, with immunity taking precedence', () => {
    const grass = relations(['fire', 'ice'], ['water'], []);
    const flying = relations(['ice'], [], ['ground']);
    expect(defensiveMultiplier([grass, flying], 'ice')).toBe(4);
    expect(defensiveMultiplier([grass, flying], 'water')).toBe(0.5);
    expect(defensiveMultiplier([grass, flying], 'ground')).toBe(0);
    expect(defensiveMultiplier([grass, relations([], ['fire'], [])], 'fire')).toBe(1);
  });
});
