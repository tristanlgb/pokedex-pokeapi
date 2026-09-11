import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { z } from 'zod';
import {
  fetchPokemonInsight,
  pokemonInsightInputSchema,
  pokemonInsightOutputSchema,
} from './tools/get-pokemon-insight.js';
const requestSchema = z.object({
  messages: z
    .array(
      z
        .object({
          role: z.enum(['user', 'assistant', 'system']),
          parts: z
            .array(
              z.object({ type: z.string(), text: z.string().max(2000).optional() }).passthrough(),
            )
            .max(100),
        })
        .passthrough(),
    )
    .min(1)
    .max(100),
  sabotage: z
    .enum(['none', 'network', 'rate-limit', 'mid-stream', 'slow', 'malformed'])
    .default('none'),
});
export async function handleResearch(request: Request): Promise<Response> {
  if (request.method !== 'POST')
    return Response.json(
      { error: 'Método no permitido.' },
      { status: 405, headers: { Allow: 'POST' } },
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'El cuerpo debe ser JSON válido.' }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success)
    return Response.json({ error: 'La solicitud de investigación no es válida.' }, { status: 400 });
  const { messages, sabotage } = parsed.data;
  const latest = [...messages].reverse().find((message) => message.role === 'user');
  const text =
    latest?.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text ?? '')
      .join(' ') ?? '';
  const name = (text.match(/research\s+(.+?)\s+and\s+build/i)?.[1] ?? text)
    .trim()
    .toLowerCase()
    .replace(/^#/, '')
    .replace(/^0+(?=\d)/, '');
  const input = pokemonInsightInputSchema.safeParse({ name });
  if (!input.success)
    return Response.json(
      { error: 'Ingresa un nombre o número de Pokémon válido (hasta 40 caracteres).' },
      { status: 400 },
    );
  if (sabotage === 'rate-limit')
    return Response.json(
      { error: 'Límite de solicitudes simulado.' },
      { status: 429, headers: { 'Retry-After': '3' } },
    );
  const stream = createUIMessageStream({
    onError: () => 'La conexión se interrumpió. Puedes reintentar la investigación.',
    async execute({ writer }) {
      const toolCallId = crypto.randomUUID();
      writer.write({ type: 'tool-input-start', toolCallId, toolName: 'getPokemonInsight' });
      writer.write({
        type: 'tool-input-delta',
        toolCallId,
        inputTextDelta: JSON.stringify(input.data),
      });
      writer.write({
        type: 'tool-input-available',
        toolCallId,
        toolName: 'getPokemonInsight',
        input: input.data,
      });
      if (sabotage === 'mid-stream') throw new Error('Interrupción simulada.');
      try {
        if (sabotage === 'slow') await new Promise((resolve) => setTimeout(resolve, 3200));
        if (sabotage === 'malformed') {
          pokemonInsightOutputSchema.parse({ id: 'invalid' });
        }
        const output = pokemonInsightOutputSchema.parse(await fetchPokemonInsight(input.data));
        writer.write({ type: 'tool-output-available', toolCallId, output });
      } catch (error) {
        writer.write({
          type: 'tool-output-error',
          toolCallId,
          errorText:
            error instanceof z.ZodError
              ? 'La respuesta no tiene el formato esperado.'
              : error instanceof Error
                ? error.message
                : 'No se pudo completar la investigación.',
        });
      }
    },
  });
  return createUIMessageStreamResponse({ stream });
}
