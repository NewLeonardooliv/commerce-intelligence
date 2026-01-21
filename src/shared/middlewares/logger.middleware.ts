import type { Elysia } from 'elysia';

export const logger = (app: Elysia) => {
  return app.onRequest(({ request }) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${request.method} ${request.url}`);
  });
};
