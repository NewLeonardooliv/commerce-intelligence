import { LlmAgent, InMemoryRunner } from '@google/adk';
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
      model: config.model || 'gemini-2.5-flash',
      instruction: config.instruction,
      tools: (config.tools || []) as any,
    });
  }

  async generateText(messages: { role: string; content: string }[]): Promise<string> {
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content || '';

    const runner = new InMemoryRunner({
      agent: this.agent,
      appName: 'commerce-intelligence',
    });

    let output = '';

    for await (const event of runner.runAsync({
      userId: 'user-1',
      sessionId: 'session-1',
      newMessage: { parts: [{ text: userMessage }] },
    })) {
      if (event.content && Array.isArray(event.content)) {
        for (const part of event.content) {
          if (part.text) {
            output += part.text;
          }
        }
      }
    }

    return output || '';
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

    const runner = new InMemoryRunner({
      agent: this.agent,
      appName: 'commerce-intelligence',
    });

    let output = '';

    for await (const event of runner.runAsync({
      userId: 'user-1',
      sessionId: 'session-1',
      newMessage: { parts: [{ text: prompt }] },
    })) {
      if (event.content && Array.isArray(event.content)) {
        for (const part of event.content) {
          if (part.text) {
            output += part.text;
          }
        }
      }
    }

    try {
      const jsonMatch = output?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('[ADK Provider] Error parsing analysis:', error);
    }

    return {
      summary: output || 'Analysis completed',
      insights: [],
      patterns: [],
      recommendations: [],
    };
  }

  async generateInsights(data: Record<string, unknown>): Promise<string[]> {
    const prompt = `Based on this data, generate 5 actionable insights:\n${JSON.stringify(data, null, 2)}`;

    const runner = new InMemoryRunner({
      agent: this.agent,
      appName: 'commerce-intelligence',
    });

    let output = '';

    for await (const event of runner.runAsync({
      userId: 'user-1',
      sessionId: 'session-1',
      newMessage: { parts: [{ text: prompt }] },
    })) {
      if (event.content && Array.isArray(event.content)) {
        for (const part of event.content) {
          if (part.text) {
            output += part.text;
          }
        }
      }
    }

    const insights =
      output
        ?.split('\n')
        .filter((line: string) => line.trim().length > 0)
        .slice(0, 5) || [];

    return insights;
  }

  getAgent(): LlmAgent {
    return this.agent;
  }
}
