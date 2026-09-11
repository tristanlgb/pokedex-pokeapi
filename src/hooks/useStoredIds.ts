import { useCallback, useEffect, useState } from 'react';
export function readStoredIds(key: string, limit = Infinity): number[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    if (!Array.isArray(value)) return [];
    return [
      ...new Set(
        value.filter(
          (id): id is number => typeof id === 'number' && Number.isSafeInteger(id) && id > 0,
        ),
      ),
    ].slice(0, limit);
  } catch {
    return [];
  }
}
export function useStoredIds(key: string, limit = Infinity) {
  const [ids, setIds] = useState(() => readStoredIds(key, limit));
  const [storageError, setStorageError] = useState('');
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(ids));
      setStorageError('');
    } catch {
      setStorageError(
        'No se pudo guardar en este dispositivo. Los cambios se conservarán durante esta sesión.',
      );
    }
  }, [ids, key]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === key || event.key === null) setIds(readStoredIds(key, limit));
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [key, limit]);
  const toggle = useCallback(
    (id: number) => {
      setIds((current) =>
        current.includes(id)
          ? current.filter((value) => value !== id)
          : current.length < limit
            ? [...current, id]
            : current,
      );
    },
    [limit],
  );
  return { ids, toggle, storageError };
}
