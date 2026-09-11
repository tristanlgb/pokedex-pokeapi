import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleResearch } from './research.js';
export const maxDuration = 30;
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  const method = request.method ?? 'GET';
  const result = await handleResearch(
    new Request('http://localhost/api/chat', {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(method !== 'GET' && method !== 'HEAD'
        ? { body: JSON.stringify(request.body ?? null) }
        : {}),
    }),
  );
  response.status(result.status);
  result.headers.forEach((value, key) => response.setHeader(key, value));
  if (result.body) for await (const chunk of result.body) response.write(Buffer.from(chunk));
  response.end();
}
