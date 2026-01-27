import { LlmAgent } from '@google/adk';
import type { IAiProvider } from '../ai/ai-provider.interface';

export type ADKAgentConfig = {
  name: string;
  description: string;
  model?: string;
  instruction: string;
  tools?: any[];
};

export class ADKProvider implements IAiProvider {
  private agent: LlmAgent;
  private config: ADKAgentConfig;

  constructor(config: ADKAgentConfig) {
    this.config = config;
    this.agent = new LlmAgent({
      name: config.name,
      description: config.description,
      model: config.model || 'gemini-2.0-flash-exp',
      instruction: config.instruction,
      tools: (config.tools || []) as any,
    });
  }

  async generateText(messages: { role: string; content: string }[]): Promise<string> {
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content || '';

    const result = await (this.agent as any).generate({
      input: userMessage,
    });

    return result?.output || '';
  }

  async complete(request: {
    messages: { role: string; content: string }[];
    temperature?: number;
    maxTokens?: number;
  }): Promise<{
    content: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }> {
    const text = await this.generateText(request.messages);

    return {
      content: text,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }

  async analyzeData(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const prompt = `Analyze the following data and provide insights:\n${JSON.stringify(data, null, 2)}`;

    const result = await (this.agent as any).generate({
      input: prompt,
    });

    try {
      const jsonMatch = result?.output?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('[ADK Provider] Error parsing analysis:', error);
    }

    return {
      summary: result?.output || 'Analysis completed',
      insights: [],
      patterns: [],
      recommendations: [],
    };
  }

  async generateInsights(data: Record<string, unknown>): Promise<string[]> {
    const prompt = `Based on this data, generate 5 actionable insights:\n${JSON.stringify(data, null, 2)}`;

    const result = await (this.agent as any).generate({
      input: prompt,
    });

    const insights =
      result?.output
        ?.split('\n')
        .filter((line: string) => line.trim().length > 0)
        .slice(0, 5) || [];

    return insights;
  }

  getAgent(): LlmAgent {
    return this.agent;
  }
}
