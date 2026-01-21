import { t } from 'elysia';

export const agentCapabilitySchema = t.Union([
  t.Literal('data-analysis'),
  t.Literal('pattern-recognition'),
  t.Literal('forecasting'),
  t.Literal('anomaly-detection'),
  t.Literal('recommendation'),
  t.Literal('sentiment-analysis'),
]);

export const agentStatusSchema = t.Union([
  t.Literal('idle'),
  t.Literal('processing'),
  t.Literal('completed'),
  t.Literal('failed'),
]);

export const createAgentSchema = t.Object({
  name: t.String({ minLength: 3, maxLength: 100 }),
  description: t.String({ minLength: 10, maxLength: 500 }),
  capabilities: t.Array(agentCapabilitySchema, { minItems: 1 }),
});

export const createTaskSchema = t.Object({
  agentId: t.String(),
  type: agentCapabilitySchema,
  input: t.Record(t.String(), t.Any()),
});

export const agentParamsSchema = t.Object({
  id: t.String(),
});

export const taskParamsSchema = t.Object({
  taskId: t.String(),
});
