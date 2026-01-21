export type AnalyticsMetric =
  | 'revenue'
  | 'orders'
  | 'customers'
  | 'conversion-rate'
  | 'average-order-value'
  | 'customer-lifetime-value';

export type TimeGranularity = 'hour' | 'day' | 'week' | 'month' | 'year';

export type AnalyticsQuery = {
  metrics: AnalyticsMetric[];
  startDate: string;
  endDate: string;
  granularity: TimeGranularity;
  filters?: Record<string, unknown>;
};

export type DataPoint = {
  timestamp: string;
  value: number;
  metadata?: Record<string, unknown>;
};

export type MetricResult = {
  metric: AnalyticsMetric;
  data: DataPoint[];
  summary: {
    total: number;
    average: number;
    min: number;
    max: number;
  };
};

export type AnalyticsResult = {
  query: AnalyticsQuery;
  results: MetricResult[];
  generatedAt: string;
};

export type Insight = {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  metrics: AnalyticsMetric[];
  confidence: number;
  createdAt: Date;
};
