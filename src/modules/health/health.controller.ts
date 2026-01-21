import { Elysia, t } from 'elysia';
import { healthService } from './health.service';
import { successResponse } from '@shared/utils/response.util';

export const healthController = new Elysia({ prefix: '/health' })
  .get(
    '/',
    async () => {
      const health = await healthService.check();
      return successResponse(health);
    },
    {
      detail: {
        summary: 'Health check',
        description: 'Check API health status',
        tags: ['Health'],
      },
    }
  )
  .get(
    '/ready',
    async () => {
      const isReady = await healthService.isReady();
      return successResponse({ ready: isReady });
    },
    {
      detail: {
        summary: 'Readiness check',
        description: 'Check if API is ready to accept requests',
        tags: ['Health'],
      },
    }
  )
  .get(
    '/live',
    () => {
      return successResponse({ alive: true });
    },
    {
      detail: {
        summary: 'Liveness check',
        description: 'Check if API is alive',
        tags: ['Health'],
      },
    }
  );
