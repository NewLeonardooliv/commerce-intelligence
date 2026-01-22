import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { analyticsController } from '../src/modules/analytics/analytics.controller';
import type { ApiResponse } from '../src/shared/types/api.types';

describe('Analytics Module', () => {
  const app = new Elysia().use(analyticsController);

  it('should query analytics data', async () => {
    const response = (await app
      .handle(
        new Request('http://localhost/analytics/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metrics: ['revenue', 'orders'],
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            granularity: 'day',
          }),
        })
      )
      .then((res) => res.json())) as ApiResponse<any>;

    expect(response.success).toBe(true);
    expect(response.data).toHaveProperty('results');
    expect(Array.isArray(response.data.results)).toBe(true);
    expect(response.data.results.length).toBe(2);
  });

  it('should validate required fields for insights', async () => {
    const response = await app.handle(
      new Request('http://localhost/analytics/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        }),
      })
    );

    expect(response.status).toBe(422);
  });

  it('should get metrics summary', async () => {
    const response = (await app
      .handle(new Request('http://localhost/analytics/metrics'))
      .then((res) => res.json())) as ApiResponse<any>;

    expect(response.success).toBe(true);
    expect(response.data).toHaveProperty('availableMetrics');
    expect(Array.isArray(response.data.availableMetrics)).toBe(true);
  });

  it('should validate date range', async () => {
    const response = await app.handle(
      new Request('http://localhost/analytics/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: ['revenue'],
          startDate: '2024-01-31',
          endDate: '2024-01-01',
          granularity: 'day',
        }),
      })
    );

    expect(response.status).toBe(500);
  });
});
