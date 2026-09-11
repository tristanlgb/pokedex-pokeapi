export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonDetails {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  species?: PokemonListItem;
  types: PokemonType[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  sprites: {
    front_default: string | null;
    front_shiny?: string | null;
    other?: {
      ['official-artwork']?: {
        front_default: string | null;
        front_shiny?: string | null;
      };
    };
  };
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonTypeResponse {
  damage_relations: {
    double_damage_from: PokemonListItem[];
    half_damage_from: PokemonListItem[];
    no_damage_from: PokemonListItem[];
  };
  pokemon: {
    pokemon: PokemonListItem;
    slot: number;
  }[];
}

export interface PokemonSpecies {
  evolution_chain: { url: string } | null;
  flavor_text_entries: { flavor_text: string; language: { name: string } }[];
  varieties: { is_default: boolean; pokemon: PokemonListItem }[];
}
export interface EvolutionNode {
  species: PokemonListItem;
  evolves_to: EvolutionNode[];
}
