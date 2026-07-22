import type { PokemonDetails } from '../types';
import { PokemonCard } from './PokemonCard';

interface PokemonGridProps {
  pokemon: PokemonDetails[];
  isFavorite: (id: number) => boolean;
  onToggleFavorite: (id: number) => void;
  onOpen: (pokemon: PokemonDetails) => void;
}

export function PokemonGrid({
  pokemon,
  isFavorite,
  onToggleFavorite,
  onOpen,
}: PokemonGridProps) {
  if (pokemon.length === 0) {
    return (
      <div className="empty-state">
        <h2>No se encontraron Pokémon</h2>
        <p>Prueba otra búsqueda o selecciona un tipo diferente.</p>
      </div>
    );
  }

  return (
    <section className="pokemon-grid">
      {pokemon.map((item) => (
        <PokemonCard
          key={item.id}
          pokemon={item}
          favorite={isFavorite(item.id)}
          onToggleFavorite={onToggleFavorite}
          onOpen={onOpen}
        />
      ))}
    </section>
  );
}
