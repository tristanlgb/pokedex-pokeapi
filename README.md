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

## Motion with intent: research action button

The research submit control is a reusable stateful button with six deliberate conditions: idle, hover/focus, loading, success, error, and disabled. Every label/icon transition crossfades and travels a few pixels using only `transform` and `opacity`; background states are layered and faded rather than swapping the button layout. The UI provides deterministic success triggers (`Gengar` and `Charizard`) and a deterministic error trigger (`missingno`) so reviewers can inspect both paths.

State content uses a **220ms cubic-bezier ease-out**: fast enough to acknowledge the action immediately while retaining a readable handoff. Hover and press feedback use **160ms** for a tighter physical response. Success and error remain visible for **1.65 seconds** before returning to idle. The native disabled state prevents spam clicks, `:focus-visible` provides a keyboard ring, and `prefers-reduced-motion` removes travel/spin/shake while retaining labels, icons, and state colors.

## Checkpoint 1: resilience and failure inventory

The primary research flow was tested by deliberate sabotage. Controls in the live UI make the important cases reproducible for reviewers.

| Case | Deliberate handling | Recovery |
| --- | --- | --- |
| First-run empty state | Explains the tool and offers “Research Pikachu” and “Prefill Gengar” actions | Start from either example |
| Empty input | Submit button is disabled and an inline instruction explains what is required | Enter a name or Pokédex number |
| Slow response | A geometry-matched profile skeleton replaces the executing state | Resolves into the real card without a large layout jump |
| No results / tool error | `missingno` renders a designed tool error rather than incomplete content | “Recover with Pikachu” |
| HTTP 429 | Route returns a real 429 and `useChat.error` renders rate-limit-specific guidance | Retry only the failed Pokémon |
| Mid-stream interruption | Route fails after validated tool input; partial output is discarded | Retry only the failed Pokémon |
| Network failure before send | A custom transport fetch rejects before the route is reached | Retry the retained request after connectivity returns |
| Malformed tool output | Invalid data is converted to `output-error`, never passed to the profile component | Run a valid request |
| Unexpected render failure | `AppErrorBoundary` replaces the crashed tree with a safe reload action | Reload without losing stored favorites |

The retry control disables itself while running, so repeated clicks cannot duplicate work. Mobile safeguards include `100dvh`, safe-area padding, blocked horizontal overflow, and a 16px input size to prevent Safari focus zoom. Checkpoint screenshots are captured after the automated browser sabotage pass.

## Automated testing

The project uses Vitest and React Testing Library for user-facing component tests and Playwright for the primary end-to-end research flow. Tests query semantic roles and accessible labels, so visual class renames do not break the suite. The AI chat route is mocked in every automated test; no test calls the real AI or PokéAPI research endpoint.

- `npm run test:unit` runs nine component tests covering empty, pending, streaming, output, error, form-validation, and tool-result behavior.
- `npm run test:e2e` runs the Chromium research flow with a deterministic mocked AI stream.
- `npm run test:all` runs the unit suite, production build, and Playwright flow in sequence.
- `.github/workflows/test.yml` runs the same checks on every push and pull request, blocking merges when a check fails.

## Interactive 3D Poké Ball lab

The capstone now includes a touch-ready 3D Poké Ball viewer built with React Three Fiber and lightweight procedural geometry. Users can drag or swipe to inspect it, pinch or scroll to zoom, switch among three material finishes, pause auto-rotation, and trigger an animated opening sequence with reactive light. The canvas is code-split and only requested when the experience approaches the viewport; reduced-motion preferences and devices reporting 4 GB of memory or less receive a designed static fallback instead.

**FE-10 performance note:** the normal application entry is 96.68 kB gzip, while the isolated 3D chunk is 228.51 kB gzip and is never part of the initial request. The scene contains no external model or texture payload, caps device pixel ratio at 1.5×, limits shadow maps to 512 px, and uses a small fixed geometry count. In a desktop Chromium smoke test it held the browser's display refresh rate during rotation; the DPR cap and static low-power fallback keep mobile cost bounded.

With more time, I would add a compressed GLB Pokémon companion with meshopt, WebGPU capability detection, and a small performance HUD for reviewer-visible frame timing.
