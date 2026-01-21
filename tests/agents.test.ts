import { describe, expect, it, beforeEach } from 'bun:test';
import { Elysia } from 'elysia';
import { agentsController } from '../src/modules/agents/agents.controller';

describe('Agents Module', () => {
  let app: Elysia;
  let createdAgentId: string;

  beforeEach(() => {
    app = new Elysia().use(agentsController);
  });

  it('should create a new agent', async () => {
    const response = await app.handle(
      new Request('http://localhost/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Agent',
          description: 'This is a test agent for unit testing',
          capabilities: ['data-analysis', 'forecasting'],
        }),
      })
    ).then(res => res.json());

    expect(response.success).toBe(true);
    expect(response.data).toHaveProperty('id');
    expect(response.data.name).toBe('Test Agent');
    expect(response.data.capabilities).toContain('data-analysis');
    
    createdAgentId = response.data.id;
  });

  it('should list all agents', async () => {
    const response = await app.handle(
      new Request('http://localhost/agents')
    ).then(res => res.json());

    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('should validate required fields', async () => {
    const response = await app.handle(
      new Request('http://localhost/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Te',
        }),
      })
    );

    expect(response.status).toBe(422);
  });
});
