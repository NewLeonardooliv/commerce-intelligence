import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { healthController } from '../src/modules/health/health.controller';
import type { ApiResponse } from '../src/shared/types/api.types';

describe('Health Module', () => {
  const app = new Elysia().use(healthController);

  it('should return health status', async () => {
    const response = (await app
      .handle(new Request('http://localhost/health'))
      .then((res) => res.json())) as ApiResponse<any>;

    expect(response.success).toBe(true);
    expect(response.data).toHaveProperty('status');
    expect(response.data.status).toBe('healthy');
  });

  it('should return readiness status', async () => {
    const response = (await app
      .handle(new Request('http://localhost/health/ready'))
      .then((res) => res.json())) as ApiResponse<any>;

    expect(response.success).toBe(true);
    expect(response.data).toHaveProperty('ready');
    expect(response.data.ready).toBe(true);
  });

  it('should return liveness status', async () => {
    const response = (await app
      .handle(new Request('http://localhost/health/live'))
      .then((res) => res.json())) as ApiResponse<any>;

    expect(response.success).toBe(true);
    expect(response.data).toHaveProperty('alive');
    expect(response.data.alive).toBe(true);
  });
});
