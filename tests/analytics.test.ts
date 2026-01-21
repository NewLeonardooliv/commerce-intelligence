import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { analyticsController } from '../src/modules/analytics/analytics.controller';

describe('Analytics Module', () => {
  const app = new Elysia().use(analyticsController);

  it('should query analytics data', async () => {
    const response = await app.handle(
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
    ).then(res => res.json());

    expect(response.success).toBe(true);
    expect(response.data).toHaveProperty('results');
    expect(Array.isArray(response.data.results)).toBe(true);
    expect(response.data.results.length).toBe(2);
  });

  it('should generate insights', async () => {
    const response = await app.handle(
      new Request('http://localhost/analytics/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: ['revenue', 'conversion-rate'],
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        }),
      })
    ).then(res => res.json());

    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0]).toHaveProperty('description');
  });

  it('should get metrics summary', async () => {
    const response = await app.handle(
      new Request('http://localhost/analytics/metrics')
    ).then(res => res.json());

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
