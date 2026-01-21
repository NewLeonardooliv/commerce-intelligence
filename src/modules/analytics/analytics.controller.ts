import { Elysia } from 'elysia';
import { analyticsService } from './analytics.service';
import { successResponse } from '@shared/utils/response.util';
import {
  analyticsQuerySchema,
  generateInsightsSchema,
} from './analytics.schema';

export const analyticsController = new Elysia({ prefix: '/analytics' })
  .post(
    '/query',
    async ({ body }) => {
      const result = await analyticsService.query(body);
      return successResponse(result);
    },
    {
      body: analyticsQuerySchema,
      detail: {
        summary: 'Query analytics',
        description: 'Query analytics data with specified metrics and date range',
        tags: ['Analytics'],
      },
    }
  )
  .post(
    '/insights',
    async ({ body }) => {
      const insights = await analyticsService.generateInsights(
        body.metrics,
        body.startDate,
        body.endDate
      );
      return successResponse(insights);
    },
    {
      body: generateInsightsSchema,
      detail: {
        summary: 'Generate insights',
        description: 'Generate AI-powered insights from analytics data',
        tags: ['Analytics'],
      },
    }
  )
  .get(
    '/metrics',
    async () => {
      const summary = await analyticsService.getMetricsSummary();
      return successResponse(summary);
    },
    {
      detail: {
        summary: 'Get metrics summary',
        description: 'Get available metrics and configurations',
        tags: ['Analytics'],
      },
    }
  );
