import type { Connect, Plugin } from 'vite';
import { createPeopleApi } from './peopleApi.ts';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function readJson(req: Connect.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : undefined;
}

/**
 * Serves `/api/*` from the Vite dev server (and `vite preview`). A real HTTP
 * endpoint, unlike a Service Worker mock: Cypress' `cy.intercept` sees every
 * request, to spy on it or to stub it.
 */
export function fakeApi({ delayMs = 300 }: { delayMs?: number } = {}): Plugin {
  const api = createPeopleApi();

  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');
    if (!pathname.startsWith('/api/')) return next();

    void (async () => {
      const body = req.method === 'POST' ? await readJson(req) : undefined;
      // A little latency, so the loading states can be seen — and waited for.
      await sleep(delayMs);
      const response = api.handle(req.method ?? 'GET', pathname, body) ?? {
        status: 404,
        body: { message: `No route for ${req.method} ${pathname}` },
      };
      res.statusCode = response.status;
      if (response.body === undefined) return res.end();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(response.body));
    })().catch(next);
  };

  return {
    name: 'fake-people-api',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
