import { tool } from 'ai';
import { z } from 'zod';

export const pokemonInsightInputSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(40)
    .describe('The English Pokémon name or Pokédex number to research.'),
});

export const pokemonInsightOutputSchema = z.object({
  id: z.number(),
  name: z.string(),
  image: z.string().url(),
  types: z.array(z.string()),
  heightMeters: z.number(),
  weightKg: z.number(),
  baseExperience: z.number().nullable(),
  totalStats: z.number(),
  strongestStat: z.object({
    name: z.string(),
    value: z.number(),
  }),
  stats: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
    }),
  ),
});

export type PokemonInsightInput = z.infer<typeof pokemonInsightInputSchema>;
export type PokemonInsightResult = z.infer<typeof pokemonInsightOutputSchema>;

type PokeApiPokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  sprites: {
    other?: { 'official-artwork'?: { front_default?: string | null } };
    front_default?: string | null;
  };
  types: Array<{ type: { name: string } }>;
  stats: Array<{ base_stat: number; stat: { name: string } }>;
};

export async function fetchPokemonInsight({
  name,
}: PokemonInsightInput): Promise<PokemonInsightResult> {
    const normalizedName = name.trim().toLowerCase();

    // Deliberately leave enough time for the UI to communicate the executing state.
    await new Promise((resolve) => setTimeout(resolve, 850));

    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(normalizedName)}`,
      { signal: AbortSignal.timeout(8_000) },
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`No Pokémon named “${name}” was found.`);
      }
      throw new Error('PokéAPI could not complete this research request.');
    }

    const pokemon = (await response.json()) as PokeApiPokemon;
    const stats = pokemon.stats.map(({ base_stat, stat }) => ({
      name: stat.name,
      value: base_stat,
    }));
    const strongestStat = stats.reduce((strongest, current) =>
      current.value > strongest.value ? current : strongest,
    );
    const image =
      pokemon.sprites.other?.['official-artwork']?.front_default ??
      pokemon.sprites.front_default;

    if (!image) {
      throw new Error(`Artwork for “${name}” is currently unavailable.`);
    }

    return {
      id: pokemon.id,
      name: pokemon.name,
      image,
      types: pokemon.types.map(({ type }) => type.name),
      heightMeters: pokemon.height / 10,
      weightKg: pokemon.weight / 10,
      baseExperience: pokemon.base_experience,
      totalStats: stats.reduce((total, stat) => total + stat.value, 0),
      strongestStat,
      stats,
    };
}

export const getPokemonInsight = tool({
  description:
    'Research one Pokémon and return a compact, structured battle profile. Use this whenever the user asks to analyze a Pokémon.',
  inputSchema: pokemonInsightInputSchema,
  outputSchema: pokemonInsightOutputSchema,
  strict: true,
  execute: fetchPokemonInsight,
});

export const pokemonTools = { getPokemonInsight };
