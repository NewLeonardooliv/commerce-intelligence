import OpenAI from 'openai';
import type {
  IAiProvider,
  AiCompletionRequest,
  AiCompletionResponse,
} from './ai-provider.interface';
import { env } from '@config/env';
import { AppError } from '@shared/errors/app-error';
import { openAiLogger } from './openai-logger';

export class OpenAiProvider implements IAiProvider {
  private client: OpenAI;
  private model: string;

  constructor() {
    if (!env.ai.apiKey) {
      throw new AppError('OpenAI API key is not configured', 500);
    }

    this.client = new OpenAI({
      apiKey: env.ai.apiKey,
    });

    this.model = env.ai.model;
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: request.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 1000,
        stream: false,
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        throw new AppError('No response content from OpenAI', 500);
      }

      const usage = {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      };

      // Log usage
      openAiLogger.logUsage(
        this.model,
        usage.promptTokens,
        usage.completionTokens,
        'completion'
      );

      return {
        content: choice.message.content,
        usage,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new AppError(`OpenAI API error: ${errorMessage}`, 500);
    }
  }

  async generateText(messages: { role: string; content: string }[]): Promise<string> {
    const response = await this.complete({
      messages: messages.map((msg) => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      })),
      temperature: 0.7,
      maxTokens: 1500,
    });
    return response.content;
  }

  async analyzeData(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const prompt = `Analyze the following data and provide insights, patterns, and recommendations:

${JSON.stringify(data, null, 2)}

Provide your analysis in the following JSON format:
{
  "summary": "Brief summary of the data",
  "insights": ["insight 1", "insight 2", ...],
  "patterns": ["pattern 1", "pattern 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}`;

    const response = await this.complete({
      messages: [
        {
          role: 'system',
          content:
            'You are a data analyst expert. Analyze data and provide actionable insights. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      maxTokens: 2000,
    });

    try {
      // Extract JSON from response (handles cases where AI adds extra text)
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      return {
        ...analysis,
        dataPoints: Object.keys(data).length,
        analyzedAt: new Date().toISOString(),
      };
    } catch (error) {
      // Fallback to a structured response if JSON parsing fails
      return {
        summary: 'Data analysis completed',
        insights: [response.content],
        patterns: [],
        recommendations: [],
        dataPoints: Object.keys(data).length,
        analyzedAt: new Date().toISOString(),
      };
    }
  }

  async generateInsights(data: Record<string, unknown>): Promise<string[]> {
    const prompt = `Based on the following data, generate 5-7 specific, actionable insights:

${JSON.stringify(data, null, 2)}

Format your response as a JSON array of strings, each containing one insight.`;

    const response = await this.complete({
      messages: [
        {
          role: 'system',
          content:
            'You are a business intelligence expert. Generate specific, data-driven insights that are actionable and valuable. Always respond with a valid JSON array of strings.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      maxTokens: 1500,
    });

    try {
      // Extract JSON array from response
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const insights = JSON.parse(jsonMatch[0]);
      return Array.isArray(insights) ? insights : [response.content];
    } catch (error) {
      // Fallback: split by newlines and filter empty lines
      return response.content
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith('{'))
        .slice(0, 7);
    }
  }
}
