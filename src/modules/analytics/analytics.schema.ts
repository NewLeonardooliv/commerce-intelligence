import { t } from 'elysia';

export const analyticsMetricSchema = t.Union([
  t.Literal('revenue'),
  t.Literal('orders'),
  t.Literal('customers'),
  t.Literal('conversion-rate'),
  t.Literal('average-order-value'),
  t.Literal('customer-lifetime-value'),
]);

export const timeGranularitySchema = t.Union([
  t.Literal('hour'),
  t.Literal('day'),
  t.Literal('week'),
  t.Literal('month'),
  t.Literal('year'),
]);

export const analyticsQuerySchema = t.Object({
  metrics: t.Array(analyticsMetricSchema, { minItems: 1 }),
  startDate: t.String(),
  endDate: t.String(),
  granularity: timeGranularitySchema,
  filters: t.Optional(t.Record(t.String(), t.Any())),
});

export const generateInsightsSchema = t.Object({
  metrics: t.Array(analyticsMetricSchema),
  startDate: t.String(),
  endDate: t.String(),
});
