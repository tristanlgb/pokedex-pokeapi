import type {
  EvolutionNode,
  PokemonDetails,
  PokemonListResponse,
  PokemonSpecies,
  PokemonTypeResponse,
} from '../types';
import { normalizeQuery, resourceId } from '../lib/pokemon';
const API_URL = 'https://pokeapi.co/api/v2';
const cache = new Map<string, unknown>();
export async function apiFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = path.startsWith('https://') ? path : API_URL + '/' + path;
  signal?.throwIfAborted();
  if (cache.has(url)) return cache.get(url) as T;
  const timeout = AbortSignal.timeout(15_000);
  const response = await fetch(url, {
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  if (!response.ok)
    throw new Error(
      response.status === 404
        ? 'Pokémon no encontrado.'
        : 'No se pudo conectar con PokéAPI. Intenta nuevamente.',
    );
  const data: T = await response.json();
  cache.set(url, data);
  return data;
}
export function getPokemonList(limit: number, offset: number, signal?: AbortSignal) {
  return apiFetch<PokemonListResponse>('pokemon?limit=' + limit + '&offset=' + offset, signal);
}
export function getPokemonDetails(nameOrId: string | number, signal?: AbortSignal) {
  return apiFetch<PokemonDetails>(
    'pokemon/' + encodeURIComponent(normalizeQuery(String(nameOrId))),
    signal,
  );
}
export function getPokemonType(type: string, signal?: AbortSignal) {
  return apiFetch<PokemonTypeResponse>('type/' + encodeURIComponent(type), signal);
}
export async function getCatalogIndex(signal?: AbortSignal) {
  // One default Pokémon per species: alternate forms don't inflate the national count.
  const list = await apiFetch<PokemonListResponse>('pokemon-species?limit=100000', signal);
  return list.results.map((item) => ({ id: resourceId(item.url), name: item.name }));
}
export async function getGenerationIds(generation: string, signal?: AbortSignal) {
  const result = await apiFetch<{ pokemon_species: { url: string }[] }>(
    'generation/' + generation,
    signal,
  );
  return new Set(result.pokemon_species.map((item) => resourceId(item.url)));
}
export function getSpecies(pokemon: PokemonDetails, signal?: AbortSignal) {
  return apiFetch<PokemonSpecies>(pokemon.species?.url ?? 'pokemon-species/' + pokemon.id, signal);
}
export async function getEvolutionChain(url: string, signal?: AbortSignal) {
  return (await apiFetch<{ chain: EvolutionNode }>(url, signal)).chain;
}
export async function loadDetails(
  ids: (number | string)[],
  signal: AbortSignal,
  onProgress?: (count: number) => void,
) {
  const results: PokemonDetails[] = new Array(ids.length);
  let next = 0;
  let complete = 0;
  await Promise.all(
    Array.from({ length: Math.min(8, ids.length) }, async () => {
      while (next < ids.length) {
        signal.throwIfAborted();
        const index = next++;
        results[index] = await getPokemonDetails(ids[index], signal);
        onProgress?.(++complete);
      }
    }),
  );
  return results;
}
