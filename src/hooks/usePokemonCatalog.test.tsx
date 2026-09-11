import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePokemonCatalog } from './usePokemonCatalog';
import type { CatalogLocation } from './useCatalogLocation';
import type { PokemonDetails } from '../types';
import { getCatalogIndex, getPokemonType, loadDetails } from '../api/pokeApi';
vi.mock('../api/pokeApi', () => ({
  getCatalogIndex: vi.fn(),
  getPokemonType: vi.fn(),
  getGenerationIds: vi.fn(),
  loadDetails: vi.fn(),
}));
const location: CatalogLocation = {
  view: 'explore',
  type: 'all',
  generation: 'all',
  sort: 'number',
  query: '',
  page: 1,
  pokemon: '',
};
const index = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  name: i === 24 ? 'pikachu' : 'pokemon-' + (i + 1),
}));
const details = (ids: (number | string)[]) =>
  ids.map(
    (id) =>
      ({
        id: Number(id),
        name: index[Number(id) - 1].name,
        stats: [],
      }) as unknown as PokemonDetails,
  );
describe('catalog state transitions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCatalogIndex).mockResolvedValue(index);
    vi.mocked(loadDetails).mockImplementation(async (ids) => details(ids));
  });
  it('searches from page 2 and restores page 1 when the query is cleared', async () => {
    const { result, rerender } = renderHook((state) => usePokemonCatalog(state, []), {
      initialProps: { ...location, page: 2 },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.pokemon[0].id).toBe(21);
    rerender({ ...location, query: 'pikachu' });
    await waitFor(() => expect(result.current.pokemon.map((item) => item.id)).toEqual([25]));
    rerender(location);
    await waitFor(() => expect(result.current.total).toBe(45));
    expect(result.current.pokemon[0].id).toBe(1);
  });
  it('paginates beyond the former 36-result cutoff', async () => {
    vi.mocked(getPokemonType).mockResolvedValue({
      pokemon: index.map((item) => ({
        slot: 1,
        pokemon: { name: item.name, url: 'https://pokeapi.co/api/v2/pokemon/' + item.id + '/' },
      })),
    } as Awaited<ReturnType<typeof getPokemonType>>);
    const { result } = renderHook(() =>
      usePokemonCatalog({ ...location, type: 'grass', page: 3 }, []),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.total).toBe(45);
    expect(result.current.pokemon.map((item) => item.id)).toEqual([41, 42, 43, 44, 45]);
  });
  it('ignores a superseded response even if a transport does not honor abort', async () => {
    let finishOld: (value: PokemonDetails[]) => void = () => {};
    vi.mocked(loadDetails).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishOld = resolve;
        }),
    );
    const { result, rerender } = renderHook((state) => usePokemonCatalog(state, []), {
      initialProps: location,
    });
    await waitFor(() => expect(loadDetails).toHaveBeenCalled());
    rerender({ ...location, query: 'pikachu' });
    await waitFor(() => expect(result.current.pokemon[0]?.id).toBe(25));
    await act(async () => finishOld(details([1])));
    expect(result.current.pokemon[0].id).toBe(25);
  });
  it('loads persisted favorites independently of the current page', async () => {
    const { result } = renderHook(() =>
      usePokemonCatalog({ ...location, view: 'favorites' }, [25, 44]),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.pokemon.map((item) => item.id)).toEqual([25, 44]);
  });
});
