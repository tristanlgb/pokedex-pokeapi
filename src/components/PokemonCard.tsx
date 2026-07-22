import { Heart, Ruler, Weight } from 'lucide-react';
import type { PokemonDetails } from '../types';

interface PokemonCardProps {
  pokemon: PokemonDetails;
  favorite: boolean;
  onToggleFavorite: (id: number) => void;
  onOpen: (pokemon: PokemonDetails) => void;
}

function formatId(id: number) {
  return `#${String(id).padStart(4, '0')}`;
}

export function PokemonCard({
  pokemon,
  favorite,
  onToggleFavorite,
  onOpen,
}: PokemonCardProps) {
  const image = pokemon.sprites.front_default;

  return (
    <article className="pokemon-card">
      <button
        type="button"
        className="card-open-button"
        aria-label={`View details for ${pokemon.name}`}
        onClick={() => onOpen(pokemon)}
      />
      <div className="card-top">
        <span className="pokemon-id">{formatId(pokemon.id)}</span>
        <button
          type="button"
          className={`heart-button ${favorite ? 'favorite' : ''}`}
          aria-label={
            favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'
          }
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(pokemon.id);
          }}
        >
          <Heart size={21} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="pokemon-image-wrapper">
        {image ? (
          <img src={image} alt="" width="150" height="150" loading="lazy" decoding="async" />
        ) : (
          <div className="image-placeholder">Sin imagen</div>
        )}
      </div>

      <h2>{pokemon.name}</h2>

      <div className="type-row">
        {pokemon.types.map(({ type }) => (
          <span key={type.name} className={`type-badge type-${type.name}`}>
            {type.name}
          </span>
        ))}
      </div>

      <div className="mini-stats">
        <span>
          <Ruler size={16} />
          {(pokemon.height / 10).toFixed(1)} m
        </span>
        <span>
          <Weight size={16} />
          {(pokemon.weight / 10).toFixed(1)} kg
        </span>
      </div>
    </article>
  );
}
