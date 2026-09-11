import { Heart, GitCompareArrows, Plus, Check } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { PokemonDetails } from '../types';
import { artwork, formatId, TYPE_COLORS, TYPE_LABELS } from '../lib/pokemon';
interface PokemonCardProps {
  pokemon: PokemonDetails;
  favorite: boolean;
  comparing: boolean;
  inTeam: boolean;
  compareFull: boolean;
  teamFull: boolean;
  onToggleFavorite: (id: number) => void;
  onCompare: (id: number) => void;
  onTeam: (id: number) => void;
  onOpen: (pokemon: PokemonDetails) => void;
}
export function PokemonCard({
  pokemon,
  favorite,
  comparing,
  inTeam,
  compareFull,
  teamFull,
  onToggleFavorite,
  onCompare,
  onTeam,
  onOpen,
}: PokemonCardProps) {
  return (
    <article
      className="pokemon-card"
      style={
        { '--type-color': TYPE_COLORS[pokemon.types[0]?.type.name] ?? '#697486' } as CSSProperties
      }
    >
      <div className="card-top">
        <span className="pokemon-id">{formatId(pokemon.id)}</span>
        <button
          className={'heart-button ' + (favorite ? 'favorite' : '')}
          aria-label={
            (favorite ? 'Quitar de favoritos a ' : 'Agregar a favoritos a ') + pokemon.name
          }
          aria-pressed={favorite}
          onClick={() => onToggleFavorite(pokemon.id)}
        >
          <Heart size={19} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <button
        className="card-detail"
        onClick={() => onOpen(pokemon)}
        aria-label={'Ver detalles de ' + pokemon.name}
      >
        <div className="pokemon-image-wrapper">
          {artwork(pokemon) ? (
            <img
              src={artwork(pokemon)!}
              alt=""
              width="180"
              height="180"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span>Sin imagen</span>
          )}
        </div>
        <h3>{pokemon.name}</h3>
        <div className="type-row">
          {pokemon.types.map(({ type }) => (
            <span key={type.name} className={'type-badge type-' + type.name}>
              {TYPE_LABELS[type.name] ?? type.name}
            </span>
          ))}
        </div>
      </button>
      <div className="card-actions">
        <button
          aria-label={(comparing ? 'Quitar del comparador a ' : 'Comparar a ') + pokemon.name}
          aria-pressed={comparing}
          disabled={compareFull && !comparing}
          onClick={() => onCompare(pokemon.id)}
        >
          <GitCompareArrows size={15} />
          {comparing ? 'Elegido' : 'Comparar'}
        </button>
        <button
          aria-label={(inTeam ? 'Quitar del equipo a ' : 'Agregar al equipo a ') + pokemon.name}
          aria-pressed={inTeam}
          disabled={teamFull && !inTeam}
          onClick={() => onTeam(pokemon.id)}
        >
          {inTeam ? <Check size={15} /> : <Plus size={15} />}Equipo
        </button>
      </div>
    </article>
  );
}
