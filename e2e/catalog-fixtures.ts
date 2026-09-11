import type { Page } from '@playwright/test';
const names: Record<number, string> = {
  1: 'bulbasaur',
  2: 'ivysaur',
  3: 'venusaur',
  4: 'charmander',
  5: 'charmeleon',
  6: 'charizard',
  7: 'squirtle',
  25: 'pikachu',
};
const resource = (id: number, kind = 'pokemon') => ({
  name: names[id] ?? 'pokemon-' + id,
  url: 'https://pokeapi.co/api/v2/' + kind + '/' + id + '/',
});
const image =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><circle cx="60" cy="60" r="40" fill="#79b99c"/></svg>',
  );
export function fixturePokemon(id: number) {
  return {
    id,
    name: names[id] ?? 'pokemon-' + id,
    height: 7,
    weight: 69,
    base_experience: 64,
    species: resource(id, 'pokemon-species'),
    types: [{ slot: 1, type: { name: id <= 40 ? 'grass' : 'water', url: '' } }],
    abilities: [{ ability: { name: 'overgrow', url: '' }, is_hidden: false }],
    stats: ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'].map(
      (name, index) => ({ base_stat: id + index + 40, effort: 0, stat: { name, url: '' } }),
    ),
    sprites: {
      front_default: image,
      front_shiny: image + '%20',
      other: { 'official-artwork': { front_default: image, front_shiny: image + '%20' } },
    },
  };
}
export async function mockCatalog(page: Page) {
  await page.route('https://pokeapi.co/api/v2/**', async (route) => {
    const url = new URL(route.request().url());
    const segments = url.pathname.split('/').filter(Boolean);
    const endpoint = segments[2];
    const key = segments[3];
    const ids = Array.from({ length: 45 }, (_, i) => i + 1);
    let data: unknown;
    if (endpoint === 'pokemon-species' && !key)
      data = {
        count: 45,
        next: null,
        previous: null,
        results: ids.map((id) => resource(id, 'pokemon-species')),
      };
    else if (endpoint === 'pokemon-species')
      data = {
        evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/1/' },
        flavor_text_entries: [
          { flavor_text: 'Un compañero para tu aventura.', language: { name: 'es' } },
        ],
        varieties: [],
      };
    else if (endpoint === 'evolution-chain')
      data = {
        chain: {
          species: resource(1, 'pokemon-species'),
          evolves_to: [
            {
              species: resource(2, 'pokemon-species'),
              evolves_to: [{ species: resource(3, 'pokemon-species'), evolves_to: [] }],
            },
          ],
        },
      };
    else if (endpoint === 'generation')
      data = {
        pokemon_species: ids
          .filter((id) => (key === '1' ? id <= 30 : id > 30))
          .map((id) => resource(id, 'pokemon-species')),
      };
    else if (endpoint === 'type')
      data = {
        pokemon: ids
          .filter((id) => (key === 'grass' ? id <= 40 : id > 40))
          .map((id) => ({ pokemon: resource(id), slot: 1 })),
        damage_relations: {
          double_damage_from: [{ name: 'fire', url: '' }],
          half_damage_from: [{ name: 'water', url: '' }],
          no_damage_from: [],
        },
      };
    else if (endpoint === 'pokemon') {
      const id = /^\d+$/.test(key)
        ? Number(key)
        : Number(Object.entries(names).find(([, name]) => name === key)?.[0]);
      if (!id) {
        await route.fulfill({ status: 404, json: {} });
        return;
      }
      data = fixturePokemon(id);
    } else {
      await route.fulfill({ status: 404, json: {} });
      return;
    }
    await route.fulfill({ json: data });
  });
}
