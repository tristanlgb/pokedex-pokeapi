import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
describe('PokéAPI transport', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllGlobals());
  it('reuses successful details and normalizes padded IDs', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 25 })));
    vi.stubGlobal('fetch', fetchMock);
    const { getPokemonDetails } = await import('./pokeApi');
    await getPokemonDetails('#025');
    await getPokemonDetails(25);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://pokeapi.co/api/v2/pokemon/25');
  });
  it('propagates abort to the actual network request', async () => {
    let networkSignal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, options: RequestInit) =>
          new Promise((_resolve, reject) => {
            networkSignal = options.signal as AbortSignal;
            networkSignal.addEventListener('abort', () => reject(networkSignal?.reason));
          }),
      ),
    );
    const { getPokemonDetails } = await import('./pokeApi');
    const controller = new AbortController();
    const pending = getPokemonDetails(25, controller.signal);
    const assertion = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort();
    await assertion;
    expect(networkSignal?.aborted).toBe(true);
  });
  it('does not cache failures, allowing retry', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 503 }))
      .mockResolvedValueOnce(new Response('{"id":25}'));
    vi.stubGlobal('fetch', fetchMock);
    const { getPokemonDetails } = await import('./pokeApi');
    await expect(getPokemonDetails(25)).rejects.toThrow('No se pudo conectar');
    await expect(getPokemonDetails(25)).resolves.toEqual({ id: 25 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
