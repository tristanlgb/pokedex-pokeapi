import { useEffect, useState } from 'react';
import { loadDetails } from '../api/pokeApi';
import type { PokemonDetails } from '../types';
export function usePokemonSelection(ids: (number | string)[]) {
  const key = ids.join(',');
  const [items, setItems] = useState<PokemonDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    loadDetails(key ? key.split(',') : [], controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setItems(data);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted)
          setError(cause instanceof Error ? cause.message : 'No se pudo cargar la selección.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [key, revision]);
  return { items, loading, error, retry: () => setRevision((value) => value + 1) };
}
