import { Heart, Share2, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { getEvolutionChain, getSpecies } from '../api/pokeApi';
import { usePokemonSelection } from '../hooks/usePokemonSelection';
import {
  artwork,
  formatId,
  resourceId,
  STAT_LABELS,
  STAT_MAX,
  TYPE_COLORS,
  TYPE_LABELS,
  statTotal,
} from '../lib/pokemon';
import type { EvolutionNode, PokemonDetails } from '../types';

function EvolutionBranch({
  node,
  currentId,
  onOpen,
}: {
  node: EvolutionNode;
  currentId: number;
  onOpen: (id: string) => void;
}) {
  const id = resourceId(node.species.url);
  return (
    <li>
      <button
        aria-current={id === currentId ? 'true' : undefined}
        onClick={() => onOpen(String(id))}
      >
        {node.species.name}
      </button>
      {node.evolves_to.length > 0 && (
        <ul>
          {node.evolves_to.map((child) => (
            <EvolutionBranch
              key={child.species.name}
              node={child}
              currentId={currentId}
              onOpen={onOpen}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
function SpeciesDetails({
  pokemon,
  onOpen,
}: {
  pokemon: PokemonDetails;
  onOpen: (id: string) => void;
}) {
  const [description, setDescription] = useState('');
  const [chain, setChain] = useState<EvolutionNode>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    async function load() {
      try {
        const species = await getSpecies(pokemon, controller.signal);
        const evolution = species.evolution_chain
          ? await getEvolutionChain(species.evolution_chain.url, controller.signal)
          : undefined;
        if (!controller.signal.aborted) {
          setDescription(
            species.flavor_text_entries
              .find((entry) => entry.language.name === 'es')
              ?.flavor_text.replace(/[\n\f]/g, ' ') ??
              'No hay una descripción en español disponible.',
          );
          setChain(evolution);
        }
      } catch {
        if (!controller.signal.aborted) setError('No se pudo cargar la información evolutiva.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [pokemon, revision]);
  if (loading) return <p role="status">Cargando descripción y evoluciones…</p>;
  if (error)
    return (
      <div role="alert">
        <p>{error}</p>
        <button onClick={() => setRevision((value) => value + 1)}>Reintentar evoluciones</button>
      </div>
    );
  return (
    <section className="species-details">
      <p>{description}</p>
      <h3>Cadena evolutiva</h3>
      {chain ? (
        <ul className="evolution-tree">
          <EvolutionBranch
            node={chain}
            currentId={resourceId(pokemon.species?.url ?? String(pokemon.id))}
            onOpen={onOpen}
          />
        </ul>
      ) : (
        <p>No hay una cadena evolutiva disponible.</p>
      )}
    </section>
  );
}
interface PokemonModalProps {
  name: string;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  onClose: () => void;
  onNavigate: (id: string) => void;
}
function PokemonDetailsContent({
  pokemon,
  favorite,
  onToggleFavorite,
  onNavigate,
}: {
  pokemon: PokemonDetails;
  favorite: boolean;
  onToggleFavorite: (id: number) => void;
  onNavigate: (id: string) => void;
}) {
  const [shiny, setShiny] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const [shareFallback, setShareFallback] = useState('');
  async function share() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus('Enlace copiado.');
    } catch {
      setShareFallback(url);
      setShareStatus('Copia este enlace para compartir la ficha.');
    }
  }
  return (
    <div
      style={
        { '--type-color': TYPE_COLORS[pokemon.types[0]?.type.name] ?? '#697486' } as CSSProperties
      }
    >
      <div className="modal-hero">
        <div>
          <span className="pokemon-id">{formatId(pokemon.id)}</span>
          <h2 id="pokemon-title">{pokemon.name}</h2>
          <div className="type-row">
            {pokemon.types.map(({ type }) => (
              <span key={type.name} className={'type-badge type-' + type.name}>
                {TYPE_LABELS[type.name] ?? type.name}
              </span>
            ))}
          </div>
          <button
            className="shiny-button"
            aria-pressed={shiny}
            disabled={!artwork(pokemon, true)}
            onClick={() => setShiny((value) => !value)}
          >
            <Sparkles size={17} />
            {shiny ? 'Aspecto shiny' : 'Ver shiny'}
          </button>
          {!artwork(pokemon, true) && <small>Aspecto shiny no disponible.</small>}
        </div>
        {artwork(pokemon, shiny) && (
          <img
            src={artwork(pokemon, shiny)!}
            alt={pokemon.name + (shiny ? ' shiny' : '')}
            width="230"
            height="230"
          />
        )}
      </div>
      <div className="modal-content">
        <div className="details-grid">
          <div>
            <strong>Altura</strong>
            <span>{pokemon.height / 10} m</span>
          </div>
          <div>
            <strong>Peso</strong>
            <span>{pokemon.weight / 10} kg</span>
          </div>
          <div>
            <strong>Experiencia base</strong>
            <span>{pokemon.base_experience ?? 'N/D'}</span>
          </div>
          <div>
            <strong>Habilidades</strong>
            <span>
              {pokemon.abilities.map(({ ability }) => ability.name.replace(/-/g, ' ')).join(', ')}
            </span>
          </div>
        </div>
        <div className="section-heading">
          <h3>Estadísticas</h3>
          <span>{statTotal(pokemon)} puntos totales</span>
        </div>
        <div className="stats-list">
          {pokemon.stats.map(({ stat, base_stat }) => (
            <div className="stat-row" key={stat.name}>
              <span>{STAT_LABELS[stat.name] ?? stat.name}</span>
              <meter
                min={0}
                max={STAT_MAX}
                value={base_stat}
                aria-label={STAT_LABELS[stat.name] ?? stat.name}
              />
              <strong>{base_stat}</strong>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button
            className={'modal-favorite ' + (favorite ? 'favorite' : '')}
            aria-pressed={favorite}
            onClick={() => onToggleFavorite(pokemon.id)}
          >
            <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
            {favorite ? 'Quitar de favoritos' : 'Guardar favorito'}
          </button>
          <button onClick={share}>
            <Share2 size={18} />
            Compartir ficha
          </button>
        </div>
        <p role="status">{shareStatus}</p>
        {shareFallback && (
          <input
            aria-label="Enlace para compartir"
            readOnly
            value={shareFallback}
            onFocus={(event) => event.target.select()}
          />
        )}
        <SpeciesDetails pokemon={pokemon} onOpen={onNavigate} />
      </div>
    </div>
  );
}
export function PokemonModal({
  name,
  favorites,
  onToggleFavorite,
  onClose,
  onNavigate,
}: PokemonModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const { items, loading, error, retry } = usePokemonSelection([name]);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="pokemon-modal"
      aria-label="Ficha de Pokémon"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <button
        autoFocus
        type="button"
        className="modal-close"
        onClick={onClose}
        aria-label="Cerrar ficha"
      >
        <X />
      </button>
      {loading ? (
        <p className="dialog-message" role="status">
          Cargando ficha…
        </p>
      ) : error ? (
        <div className="dialog-message" role="alert">
          <p>{error}</p>
          <button onClick={retry}>Reintentar</button>
        </div>
      ) : (
        items[0] && (
          <PokemonDetailsContent
            key={items[0].id}
            pokemon={items[0]}
            favorite={favorites.includes(items[0].id)}
            onToggleFavorite={onToggleFavorite}
            onNavigate={onNavigate}
          />
        )
      )}
    </dialog>
  );
}
