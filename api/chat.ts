import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from 'ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  fetchPokemonInsight,
  pokemonInsightInputSchema,
} from './tools/get-pokemon-insight.js';

export const maxDuration = 30;

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { messages, sabotage = 'none' } = request.body as {
    messages: UIMessage[];
    sabotage?: string;
  };

  if (sabotage === 'rate-limit') {
    response.setHeader('Retry-After', '3');
    response.status(429).json({
      error: 'The research service is temporarily rate limited.',
      retryAfterSeconds: 3,
    });
    return;
  }
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  const userText = latestUserMessage?.parts
    .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join(' ') ?? '';
  const requestedName =
    userText.match(/research\s+(.+?)\s+and\s+build/i)?.[1] ??
    userText.match(/research\s+([^\s.,!?]+)/i)?.[1] ??
    userText.trim();
  const input = pokemonInsightInputSchema.parse({ name: requestedName });
  const toolCallId = crypto.randomUUID();

  const stream = createUIMessageStream({
    originalMessages: messages,
    onError: () => 'The research stream was interrupted. Your request is safe to retry.',
    async execute({ writer }) {
      writer.write({
        type: 'tool-input-start',
        toolCallId,
        toolName: 'getPokemonInsight',
      });

      const serializedInput = JSON.stringify(input);
      for (const inputTextDelta of serializedInput) {
        writer.write({ type: 'tool-input-delta', toolCallId, inputTextDelta });
        await new Promise((resolve) => setTimeout(resolve, 22));
      }

      writer.write({
        type: 'tool-input-available',
        toolCallId,
        toolName: 'getPokemonInsight',
        input,
      });

      if (sabotage === 'mid-stream') {
        await new Promise((resolve) => setTimeout(resolve, 450));
        throw new Error('The response stream was interrupted after tool input was accepted.');
      }

      try {
        if (sabotage === 'slow') {
          await new Promise((resolve) => setTimeout(resolve, 3_200));
        }

        if (sabotage === 'malformed') {
          writer.write({
            type: 'tool-output-error',
            toolCallId,
            errorText: 'The tool returned an invalid response shape. No unsafe data was rendered.',
          });
          return;
        }

        const output = await fetchPokemonInsight(input);
        writer.write({ type: 'tool-output-available', toolCallId, output });
      } catch (error) {
        writer.write({
          type: 'tool-output-error',
          toolCallId,
          errorText:
            error instanceof Error
              ? error.message
              : 'The research tool encountered an unexpected error.',
        });
      }
    },
  });
  const streamResponse = createUIMessageStreamResponse({ stream });

  response.status(streamResponse.status);
  streamResponse.headers.forEach((value, key) => response.setHeader(key, value));

  if (!streamResponse.body) {
    response.end();
    return;
  }

  for await (const chunk of streamResponse.body) {
    response.write(Buffer.from(chunk));
  }
  response.end();
}
