import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
function researchApi(): Plugin {
  return {
    name: 'local-research-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (request, response) => {
        try {
          const chunks: Buffer[] = [];
          let bytes = 0;
          for await (const chunk of request) {
            bytes += chunk.length;
            if (bytes > 256_000) {
              response.statusCode = 413;
              response.end('Solicitud demasiado grande.');
              return;
            }
            chunks.push(Buffer.from(chunk));
          }
          const { handleResearch } = await server.ssrLoadModule('/api/research.ts');
          const method = request.method ?? 'GET';
          const result: Response = await handleResearch(
            new Request('http://localhost/api/chat', {
              method,
              headers: { 'Content-Type': 'application/json' },
              ...(method !== 'GET' && method !== 'HEAD'
                ? { body: Buffer.concat(chunks).toString() }
                : {}),
            }),
          );
          response.statusCode = result.status;
          result.headers.forEach((value, key) => response.setHeader(key, value));
          if (result.body)
            for await (const chunk of result.body) response.write(Buffer.from(chunk));
          response.end();
        } catch (error) {
          server.config.logger.error(
            error instanceof Error ? error.message : 'Error de investigación',
          );
          if (!response.headersSent) {
            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
          }
          response.end(JSON.stringify({ error: 'No se pudo completar la investigación.' }));
        }
      });
    },
  };
}
export default defineConfig({ plugins: [react(), researchApi()] });
