import type { Elysia } from 'elysia';
import { generateId } from '../utils/id.util';

export const requestId = (app: Elysia) => {
  return app.derive(({ request }) => {
    const requestId = request.headers.get('x-request-id') || generateId();
    
    return {
      requestId,
    };
  });
};
