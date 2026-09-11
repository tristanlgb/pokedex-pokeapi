import type { PokemonDetails } from '../types';
import { PokemonCard } from './PokemonCard';
interface PokemonGridProps {
  pokemon: PokemonDetails[];
  favorites: number[];
  comparing: number[];
  team: number[];
  onToggleFavorite: (id: number) => void;
  onCompare: (id: number) => void;
  onTeam: (id: number) => void;
  onOpen: (pokemon: PokemonDetails) => void;
}
export function PokemonGrid({ pokemon, favorites, comparing, team, ...actions }: PokemonGridProps) {
  return (
    <section className="pokemon-grid" aria-label="Lista de Pokémon">
      {pokemon.map((item) => (
        <PokemonCard
          key={item.id}
          pokemon={item}
          favorite={favorites.includes(item.id)}
          comparing={comparing.includes(item.id)}
          inTeam={team.includes(item.id)}
          compareFull={comparing.length >= 2}
          teamFull={team.length >= 6}
          {...actions}
        />
      ))}
    </section>
  );
}
export function CatalogSkeleton() {
  return (
    <div className="pokemon-grid" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div className="catalog-skeleton" key={index}>
          <div />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
