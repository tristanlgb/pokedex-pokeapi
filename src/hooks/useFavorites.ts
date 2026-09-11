import { useStoredIds } from './useStoredIds';
export function useFavorites() {
  const {
    ids: favorites,
    toggle: toggleFavorite,
    storageError,
  } = useStoredIds('pokedex-favorites');
  return {
    favorites,
    toggleFavorite,
    isFavorite: (id: number) => favorites.includes(id),
    storageError,
  };
}
