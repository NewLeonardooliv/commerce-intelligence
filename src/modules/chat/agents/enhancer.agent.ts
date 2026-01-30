import type { IAgent, AgentContext, EnhancedResponse } from '../types/agent.types';
import { LlmAgent, InMemoryRunner } from '@google/adk';

export class EnhancerAgent implements IAgent {
  role = 'enhancer' as const;
  private adkAgent: LlmAgent;

  constructor() {
    this.adkAgent = new LlmAgent({
      name: 'enhancer',
      description: 'Enhances and refines responses',
      model: 'gemini-2.5-flash',
      instruction: `You are a response enhancer for e-commerce analytics.

Your task: Improve the Current Response to make it clearer and more professional.

IMPORTANT:
- Make the response clearer and more structured
- Keep it in Portuguese (pt-BR)
- Highlight important metrics
- Add appropriate formatting
- Keep professional but accessible tone
- Return ONLY the enhanced response text`,
    });
  }

  async process(context: AgentContext): Promise<AgentContext> {
    // Skip if no raw response
    if (!context.rawResponse) {
      console.log(`[${this.role}] Skipping - no response to enhance`);
      return context;
    }

    console.log(`[${this.role}] Enhancing response...`);

    const enhanced = await this.enhanceResponse(context);

    console.log(`[${this.role}] Response enhanced`);

    return {
      ...context,
      conversationHistory: [
        ...context.conversationHistory,
        {
          role: 'assistant',
          content: enhanced.content,
          metadata: {
            agent: 'enhancer',
            sources: enhanced.sources,
            confidence: enhanced.confidence,
            suggestions: enhanced.suggestions,
          },
        },
      ],
    };
  }

  private async enhanceResponse(context: AgentContext): Promise<EnhancedResponse> {
    try {
      const runner = new InMemoryRunner({
        agent: this.adkAgent,
        appName: 'commerce-intelligence',
      });

      const userId = 'user-1';
      const sessionId = `session-${Date.now()}`;

      runner.sessionService.createSession({
        userId,
        sessionId,
        appName: 'commerce-intelligence',
      });

      const prompt = this.buildPrompt(context);

      let output = '';
      const runStream = runner.runAsync({
        userId,
        sessionId,
        newMessage: { role: 'user', parts: [{ text: prompt }] }
      });

      for await (const event of runStream) {
        const content = (event as any).content;
        if (content?.parts && Array.isArray(content.parts)) {
          for (const part of content.parts) {
            if (part.text) output += part.text;
          }
        } else if ((event as any).text) {
          output += (event as any).text;
        }
      }

      const enhancedText = output || context.rawResponse!;

      return {
        content: enhancedText,
        sources: this.extractSources(context),
        confidence: this.calculateConfidence(context),
        suggestions: context.suggestions || [],
      };
    } catch (error) {
      console.error(`[${this.role}] Error:`, error);
      return {
        content: context.rawResponse!,
        sources: this.extractSources(context),
        confidence: this.calculateConfidence(context),
        suggestions: context.suggestions || [],
      };
    }
  }

  private buildPrompt(context: AgentContext): string {
    const parts: string[] = [];

    parts.push(`User asked: "${context.userQuery}"\n`);

    if (context.rawResponse) {
      parts.push(`Current Response:\n"${context.rawResponse}"\n`);
    }

    if (context.queryResults && context.queryResults.length > 0) {
      parts.push(`Data was used: Yes (${context.queryResults.length} records)\n`);
    }

    parts.push(`Enhance this response to make it clearer and more professional in Portuguese.`);

    return parts.join('\n');
  }

  private extractSources(context: AgentContext): string[] {
    const sources: string[] = [];

    if (context.queryResults && context.queryResults.length > 0) {
      sources.push('Banco de dados de produtos');
      sources.push('Histórico de pedidos');
    }

    if (context.interpretation) {
      sources.push('Análise de intenção com IA');
    }

    return sources;
  }

  private calculateConfidence(context: AgentContext): number {
    let confidence = 0.5;

    if (context.interpretation) {
      confidence += context.interpretation.confidence * 0.3;
    }

    if (context.queryResults && context.queryResults.length > 0) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }
}
