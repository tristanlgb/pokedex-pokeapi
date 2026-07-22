# Pokédex con React, TypeScript y PokéAPI

Aplicación frontend desarrollada con React + TypeScript que consume la API pública de PokéAPI.

## Funcionalidades

- Listado paginado de Pokémon.
- Búsqueda por nombre o número.
- Filtro por tipo.
- Modal con información detallada.
- Estadísticas visuales.
- Favoritos guardados en `localStorage`.
- Diseño responsive.
- Estados de carga y manejo de errores.

## Instalación

```bash
npm install
npm run dev
```

Luego abre la URL que indique Vite, normalmente:

```text
http://localhost:5173
```

## Compilar para producción

```bash
npm run build
npm run preview
```

## API utilizada

PokéAPI: https://pokeapi.co/

No requiere API key.

## Generative UI: Pokémon Research Agent

The **Generative UI lab** demonstrates an end-to-end server tool call. A user asks the agent to research a Pokémon, AI SDK streams a typed tool part to the browser, the server queries PokéAPI, and the structured output renders as a battle-profile component with a small stats chart.

The UI gives every tool lifecycle state its own treatment:

- `input-streaming`: animated indigo interpretation state.
- `input-available`: amber execution state showing the validated Pokémon name.
- `output-available`: green structured profile with metrics and stat bars.
- `output-error`: dashed red recovery state with a safe retry action.

Use **Test designed failure** in the UI to intentionally query `missingno` and verify the error experience.

### Tool contract

Definition: [`api/tools/get-pokemon-insight.ts`](api/tools/get-pokemon-insight.ts)

**Name:** `getPokemonInsight`

**Purpose:** Research one Pokémon by English name or Pokédex number and return a compact battle profile.

**Input schema (Zod):**

```ts
z.object({
  name: z.string().min(1).max(40),
})
```

**Return shape:**

```ts
{
  id: number;
  name: string;
  image: string;
  types: string[];
  heightMeters: number;
  weightKg: number;
  baseExperience: number | null;
  totalStats: number;
  strongestStat: { name: string; value: number };
  stats: Array<{ name: string; value: number }>;
}
```

The server route lives at [`api/chat.ts`](api/chat.ts). It uses AI SDK's UI message stream protocol to emit the typed tool lifecycle while the Zod-validated tool executes on the server. The focused demo uses a deterministic intent extractor, so reviewers can run it without API keys or a paid model account. The tool contract is compatible with `streamText({ tools: pokemonTools })` when a model provider is enabled.

### Deployment

No provider API key is required for the deployed evaluation demo. To let a model choose among multiple tools later, pass `pokemonTools` to AI SDK `streamText` and configure AI Gateway or another provider; no secrets should be committed to this repository.
