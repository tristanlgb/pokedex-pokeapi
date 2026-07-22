import { Heart, X } from 'lucide-react';
import type { PokemonDetails } from '../types';

interface PokemonModalProps {
  pokemon: PokemonDetails;
  favorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: number) => void;
}

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Ataque especial',
  'special-defense': 'Defensa especial',
  speed: 'Velocidad',
};

export function PokemonModal({
  pokemon,
  favorite,
  onClose,
  onToggleFavorite,
}: PokemonModalProps) {
  const image =
    pokemon.sprites.other?.['official-artwork']?.front_default ??
    pokemon.sprites.front_default;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="pokemon-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalles de ${pokemon.name}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X />
        </button>

        <div className="modal-hero">
          <div>
            <span className="pokemon-id">
              #{String(pokemon.id).padStart(4, '0')}
            </span>
            <h2>{pokemon.name}</h2>
            <div className="type-row">
              {pokemon.types.map(({ type }) => (
                <span key={type.name} className={`type-badge type-${type.name}`}>
                  {type.name}
                </span>
              ))}
            </div>
          </div>

          {image && <img src={image} alt={pokemon.name} />}
        </div>

        <div className="modal-content">
          <div className="details-grid">
            <div>
              <strong>Altura</strong>
              <span>{(pokemon.height / 10).toFixed(1)} m</span>
            </div>
            <div>
              <strong>Peso</strong>
              <span>{(pokemon.weight / 10).toFixed(1)} kg</span>
            </div>
            <div>
              <strong>Experiencia base</strong>
              <span>{pokemon.base_experience ?? 'N/D'}</span>
            </div>
            <div>
              <strong>Habilidades</strong>
              <span>
                {pokemon.abilities
                  .map(({ ability }) => ability.name.replace('-', ' '))
                  .join(', ')}
              </span>
            </div>
          </div>

          <h3>Estadísticas</h3>
          <div className="stats-list">
            {pokemon.stats.map(({ stat, base_stat }) => (
              <div className="stat-row" key={stat.name}>
                <span>{STAT_LABELS[stat.name] ?? stat.name}</span>
                <div className="stat-track">
                  <div
                    className="stat-value"
                    style={{ width: `${Math.min(base_stat, 160) / 1.6}%` }}
                  />
                </div>
                <strong>{base_stat}</strong>
              </div>
            ))}
          </div>

          <button
            type="button"
            className={`modal-favorite ${favorite ? 'favorite' : ''}`}
            onClick={() => onToggleFavorite(pokemon.id)}
          >
            <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
            {favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          </button>
        </div>
      </section>
    </div>
  );
}
