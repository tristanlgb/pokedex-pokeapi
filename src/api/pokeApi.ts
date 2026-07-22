import type {
  PokemonDetails,
  PokemonListResponse,
  PokemonTypeResponse,
} from '../types';

const API_URL = 'https://pokeapi.co/api/v2';

async function apiFetch<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Pokémon no encontrado.');
    }

    throw new Error('No se pudo conectar con PokéAPI.');
  }

  return response.json() as Promise<T>;
}

export function getPokemonList(
  limit: number,
  offset: number,
): Promise<PokemonListResponse> {
  return apiFetch<PokemonListResponse>(
    `${API_URL}/pokemon?limit=${limit}&offset=${offset}`,
  );
}

export function getPokemonDetails(
  nameOrId: string | number,
): Promise<PokemonDetails> {
  return apiFetch<PokemonDetails>(
    `${API_URL}/pokemon/${String(nameOrId).toLowerCase()}`,
  );
}

export async function getPokemonByType(
  type: string,
): Promise<PokemonDetails[]> {
  const response = await apiFetch<PokemonTypeResponse>(
    `${API_URL}/type/${type}`,
  );

  const firstPokemon = response.pokemon.slice(0, 36);

  return Promise.all(
    firstPokemon.map(({ pokemon }) => getPokemonDetails(pokemon.name)),
  );
}
