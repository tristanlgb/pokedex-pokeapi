import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readStoredIds, useStoredIds } from './useStoredIds';
describe('persistent selections', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());
  it('rejects invalid JSON and sanitizes stored IDs', () => {
    localStorage.setItem('ids', '{}');
    expect(readStoredIds('ids')).toEqual([]);
    localStorage.setItem('ids', '[1,1,2,-2,0,1.2,"3",null]');
    expect(readStoredIds('ids')).toEqual([1, 2]);
    localStorage.setItem('ids', '{broken');
    expect(readStoredIds('ids')).toEqual([]);
  });
  it('enforces the team limit but lets a member be removed', () => {
    const { result } = renderHook(() => useStoredIds('team', 6));
    act(() => {
      for (let id = 1; id <= 7; id++) result.current.toggle(id);
    });
    expect(result.current.ids).toEqual([1, 2, 3, 4, 5, 6]);
    act(() => result.current.toggle(3));
    act(() => result.current.toggle(7));
    expect(result.current.ids).toEqual([1, 2, 4, 5, 6, 7]);
  });
  it('keeps the UI usable when storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded');
    });
    const { result } = renderHook(() => useStoredIds('ids'));
    act(() => result.current.toggle(25));
    await waitFor(() => expect(result.current.storageError).not.toBe(''));
    expect(result.current.ids).toEqual([25]);
  });
});
