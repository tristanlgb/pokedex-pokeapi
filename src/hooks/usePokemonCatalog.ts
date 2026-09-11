import { useEffect, useState } from 'react';
import { getCatalogIndex, getGenerationIds, getPokemonType, loadDetails } from '../api/pokeApi';
import { normalizeQuery, resourceId, statTotal } from '../lib/pokemon';
import type { PokemonDetails } from '../types';
import type { CatalogLocation } from './useCatalogLocation';
export const PAGE_SIZE = 20;
export function usePokemonCatalog(location: CatalogLocation, favorites: number[], enabled = true) {
  const { view, type, generation, sort, query, page } = location;
  const [result, setResult] = useState<{ pokemon: PokemonDetails[]; total: number }>({
    pokemon: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [revision, setRevision] = useState(0);
  const favoriteKey = view === 'favorites' ? favorites.join(',') : '';
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const { signal } = controller;
    setLoading(true);
    setError('');
    setProgress(0);
    async function load() {
      try {
        const [index, typeData, generationIds] = await Promise.all([
          getCatalogIndex(signal),
          type === 'all' ? undefined : getPokemonType(type, signal),
          generation === 'all' ? undefined : getGenerationIds(generation, signal),
        ]);
        const typeIds =
          typeData && new Set(typeData.pokemon.map(({ pokemon }) => resourceId(pokemon.url)));
        const favoriteIds = new Set(favoriteKey.split(',').map(Number));
        const normalized = normalizeQuery(query);
        const filtered = index.filter(
          (item) =>
            (!typeIds || typeIds.has(item.id)) &&
            (!generationIds || generationIds.has(item.id)) &&
            (view !== 'favorites' || favoriteIds.has(item.id)) &&
            (!normalized ||
              (/^\d+$/.test(normalized)
                ? item.id === Number(normalized)
                : item.name.includes(normalized))),
        );
        filtered.sort(
          sort === 'name' ? (a, b) => a.name.localeCompare(b.name) : (a, b) => a.id - b.id,
        );
        const offset =
          (Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))) - 1) * PAGE_SIZE;
        let pokemon: PokemonDetails[];
        if (sort === 'total' || sort === 'speed') {
          const all = await loadDetails(
            filtered.map((item) => item.id),
            signal,
            (count) => {
              if (!signal.aborted) setProgress(count);
            },
          );
          const value = (item: PokemonDetails) =>
            sort === 'total'
              ? statTotal(item)
              : (item.stats.find(({ stat }) => stat.name === 'speed')?.base_stat ?? 0);
          all.sort((a, b) => value(b) - value(a) || a.id - b.id);
          pokemon = all.slice(offset, offset + PAGE_SIZE);
        } else {
          pokemon = await loadDetails(
            filtered.slice(offset, offset + PAGE_SIZE).map((item) => item.id),
            signal,
          );
        }
        if (!signal.aborted) setResult({ pokemon, total: filtered.length });
      } catch (cause) {
        if (!signal.aborted) {
          setError(cause instanceof Error ? cause.message : 'No se pudo cargar el catálogo.');
          controller.abort();
          setLoading(false);
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [view, type, generation, sort, query, page, favoriteKey, revision, enabled]);
  return { ...result, loading, error, progress, retry: () => setRevision((value) => value + 1) };
}
