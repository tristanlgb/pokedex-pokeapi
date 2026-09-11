import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleResearch } from '../../api/research';
import { fetchPokemonInsight } from '../../api/tools/get-pokemon-insight';
import { pikachuInsight } from './fixtures';
vi.mock('../../api/tools/get-pokemon-insight', async (original) => ({
  ...(await original<typeof import('../../api/tools/get-pokemon-insight')>()),
  fetchPokemonInsight: vi.fn(),
}));
const request = (body: unknown) =>
  new Request('http://localhost/api/chat', { method: 'POST', body: JSON.stringify(body) });
const valid = {
  messages: [
    {
      role: 'user',
      parts: [{ type: 'text', text: 'Research #025 and build its battle profile.' }],
    },
  ],
};
describe('research API contract', () => {
  beforeEach(() => {
    vi.mocked(fetchPokemonInsight).mockResolvedValue(pikachuInsight);
  });
  it('rejects invalid method and payloads without throwing', async () => {
    expect((await handleResearch(new Request('http://localhost/api/chat'))).status).toBe(405);
    for (const body of [
      null,
      {},
      { messages: 'invalid' },
      { messages: [] },
      { ...valid, sabotage: 'unknown' },
    ])
      expect((await handleResearch(request(body))).status).toBe(400);
  });
  it('normalizes IDs and streams a validated real tool result', async () => {
    const response = await handleResearch(request(valid));
    const body = await response.text();
    expect(fetchPokemonInsight).toHaveBeenCalledWith({ name: '25' });
    expect(body).toContain('tool-output-available');
    expect(body).toContain('pikachu');
  });
  it('prevents malformed output from reaching the profile component', async () => {
    vi.mocked(fetchPokemonInsight).mockResolvedValue({ id: 25 } as typeof pikachuInsight);
    const body = await (await handleResearch(request(valid))).text();
    expect(body).toContain('tool-output-error');
    expect(body).not.toContain('tool-output-available');
  });
  it('returns a real 429 for the demo recovery control', async () => {
    const response = await handleResearch(request({ ...valid, sabotage: 'rate-limit' }));
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('3');
  });
});
