import type { PokemonDetails } from '../types';
export const TYPE_LABELS: Record<string, string> = {
  normal: 'Normal',
  fire: 'Fuego',
  water: 'Agua',
  electric: 'Eléctrico',
  grass: 'Planta',
  ice: 'Hielo',
  fighting: 'Lucha',
  poison: 'Veneno',
  ground: 'Tierra',
  flying: 'Volador',
  psychic: 'Psíquico',
  bug: 'Bicho',
  rock: 'Roca',
  ghost: 'Fantasma',
  dragon: 'Dragón',
  dark: 'Siniestro',
  steel: 'Acero',
  fairy: 'Hada',
};
export const TYPE_COLORS: Record<string, string> = {
  normal: '#697486',
  fire: '#d95b36',
  water: '#407eda',
  electric: '#c69915',
  grass: '#388c69',
  ice: '#3396a6',
  fighting: '#bc4848',
  poison: '#9860bb',
  ground: '#b88745',
  flying: '#758bd2',
  psychic: '#c85b8a',
  bug: '#829738',
  rock: '#9c8959',
  ghost: '#7766a6',
  dragon: '#6760c8',
  dark: '#666479',
  steel: '#678693',
  fairy: '#c279a6',
};
export const STAT_LABELS: Record<string, string> = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Ataque especial',
  'special-defense': 'Defensa especial',
  speed: 'Velocidad',
};
export const GENERATIONS = [
  'Kanto',
  'Johto',
  'Hoenn',
  'Sinnoh',
  'Teselia',
  'Kalos',
  'Alola',
  'Galar',
  'Paldea',
];
export const STAT_MAX = 255;
export function artwork(pokemon: PokemonDetails, shiny = false) {
  const official = pokemon.sprites.other?.['official-artwork'];
  return shiny
    ? (official?.front_shiny ?? pokemon.sprites.front_shiny)
    : (official?.front_default ?? pokemon.sprites.front_default);
}
export function formatId(id: number) {
  return '#' + String(id).padStart(4, '0');
}
export function statTotal(pokemon: PokemonDetails) {
  return pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0);
}
export function resourceId(url: string) {
  return Number(url.split('/').filter(Boolean).pop());
}
export function normalizeQuery(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^#/, '')
    .replace(/^0+(?=\d)/, '')
    .replace(/\s+/g, '-');
}
