import type {
  AnalyticsQuery,
  AnalyticsResult,
  MetricResult,
  DataPoint,
  Insight,
  AnalyticsMetric,
} from '@shared/types/analytics.types';
import { ValidationError } from '@shared/errors/app-error';
import { isValidDateRange } from '@shared/utils/date.util';
import { aiService } from '@infrastructure/ai/ai-service';
import { generateInsightId } from '@shared/utils/id.util';

class AnalyticsService {
  async query(query: AnalyticsQuery): Promise<AnalyticsResult> {
    this.validateQuery(query);
    
    const results = await Promise.all(
      query.metrics.map(metric => this.getMetricData(metric, query))
    );
    
    return {
      query,
      results,
      generatedAt: new Date().toISOString(),
    };
  }
  
  private validateQuery(query: AnalyticsQuery): void {
    if (!isValidDateRange(query.startDate, query.endDate)) {
      throw new ValidationError('Invalid date range: startDate must be before endDate');
    }
  }
  
  private async getMetricData(
    metric: AnalyticsMetric,
    query: AnalyticsQuery
  ): Promise<MetricResult> {
    const dataPoints = this.generateMockDataPoints(
      query.startDate,
      query.endDate,
      query.granularity
    );
    
    const values = dataPoints.map(dp => dp.value);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return {
      metric,
      data: dataPoints,
      summary: {
        total,
        average,
        min,
        max,
      },
    };
  }
  
  private generateMockDataPoints(
    startDate: string,
    endDate: string,
    granularity: string
  ): DataPoint[] {
    const points: DataPoint[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const numPoints = Math.min(30, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    for (let i = 0; i < numPoints; i++) {
      const timestamp = new Date(start.getTime() + (i * 24 * 60 * 60 * 1000));
      
      points.push({
        timestamp: timestamp.toISOString(),
        value: Math.floor(Math.random() * 10000) + 1000,
        metadata: {
          granularity,
        },
      });
    }
    
    return points;
  }
  
  async generateInsights(
    metrics: AnalyticsMetric[],
    startDate: string,
    endDate: string
  ): Promise<Insight[]> {
    this.validateQuery({ metrics, startDate, endDate, granularity: 'day' });
    
    const mockData = {
      metrics,
      dateRange: { startDate, endDate },
      sampleData: this.generateMockDataPoints(startDate, endDate, 'day'),
    };
    
    const aiInsights = await aiService.generateInsights(mockData);
    
    return aiInsights.map((insight, index) => ({
      id: generateInsightId(),
      type: this.getInsightType(index),
      title: `Insight ${index + 1}`,
      description: insight,
      severity: this.getRandomSeverity(),
      metrics,
      confidence: Math.random() * 0.3 + 0.7,
      createdAt: new Date(),
    }));
  }
  
  private getInsightType(index: number): 'trend' | 'anomaly' | 'recommendation' {
    const types: Array<'trend' | 'anomaly' | 'recommendation'> = ['trend', 'anomaly', 'recommendation'];
    return types[index % 3];
  }
  
  private getRandomSeverity(): 'low' | 'medium' | 'high' {
    const severities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    return severities[Math.floor(Math.random() * 3)];
  }
  
  async getMetricsSummary(): Promise<Record<string, unknown>> {
    return {
      totalMetrics: 6,
      availableMetrics: [
        'revenue',
        'orders',
        'customers',
        'conversion-rate',
        'average-order-value',
        'customer-lifetime-value',
      ],
      supportedGranularities: ['hour', 'day', 'week', 'month', 'year'],
    };
  }
}

export const analyticsService = new AnalyticsService();
