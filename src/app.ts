import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';

import { env } from '@config/env';
import { swaggerConfig } from '@config/swagger';

import { errorHandler } from '@shared/errors/error-handler';
import { logger } from '@shared/middlewares/logger.middleware';
import { requestId } from '@shared/middlewares/request-id.middleware';

import { healthController } from '@modules/health/health.controller';
import { analyticsController } from '@modules/analytics/analytics.controller';

const app = new Elysia()
  .use(cors())
  .use(swagger(swaggerConfig))
  .use(errorHandler)
  .use(logger)
  .use(requestId)
  .get('/', () => ({
    message: 'Commerce Intelligence API',
    version: '1.0.0',
    documentation: '/swagger',
  }))
  .group(`/api/${env.apiVersion}`, (app) =>
    app
      .use(healthController)
      .use(analyticsController)
  )
  .listen(env.port);

console.log(`🚀 Server is running at http://localhost:${app.server?.port}`);
console.log(`📚 API Documentation: http://localhost:${app.server?.port}/swagger`);
console.log(`🌍 Environment: ${env.nodeEnv}`);

export type App = typeof app;
