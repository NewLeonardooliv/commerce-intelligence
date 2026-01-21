import type {
  IAiProvider,
  AiCompletionRequest,
  AiCompletionResponse,
} from './ai-provider.interface';

export class MockAiProvider implements IAiProvider {
  async complete(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    const lastMessage = request.messages[request.messages.length - 1];

    return {
      content: `Mock AI response to: ${lastMessage.content}`,
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      },
    };
  }

  async analyzeData(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return {
      summary: 'Mock data analysis',
      insights: ['Insight 1', 'Insight 2'],
      patterns: ['Pattern 1', 'Pattern 2'],
      recommendations: ['Recommendation 1', 'Recommendation 2'],
      dataPoints: Object.keys(data).length,
    };
  }

  async generateInsights(data: Record<string, unknown>): Promise<string[]> {
    return [
      'Revenue has increased by 15% compared to last period',
      'Customer acquisition cost is trending downward',
      'Peak sales occur between 2-4 PM',
      'Mobile traffic accounts for 65% of total visits',
      'Product category X shows highest conversion rate',
    ];
  }
}
