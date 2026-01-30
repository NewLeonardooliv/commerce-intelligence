import type { IAgent, AgentContext } from '../types/agent.types';
import { LlmAgent, InMemoryRunner } from '@google/adk';

export class ResponderAgent implements IAgent {
  role = 'responder' as const;
  private adkAgent: LlmAgent;

  constructor() {
    this.adkAgent = new LlmAgent({
      name: 'responder',
      description: 'Generates responses based on data and context',
      model: 'gemini-2.5-flash',
      instruction: `You are a response generator for e-commerce analytics.

Your task: Create a clear, informative response in Portuguese based on the data provided.

IMPORTANT:
- Answer EXACTLY what the user asked
- Use data from Database Results section
- Be specific with numbers and statistics
- Use Portuguese (pt-BR)
- Keep it conversational but professional
- Return ONLY the response text, no metadata`,
    });
  }

  async process(context: AgentContext): Promise<AgentContext> {
    // Skip if no interpretation or data
    if (!context.interpretation && !context.queryResults && !context.mcpResults && !context.predictResults) {
      console.log(`[${this.role}] Skipping - no data available`);
      return context;
    }

    console.log(`[${this.role}] Generating response...`);

    const response = await this.generateResponse(context);

    console.log(`[${this.role}] Response generated`);

    return {
      ...context,
      rawResponse: response,
    };
  }

  private async generateResponse(context: AgentContext): Promise<string> {
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
        newMessage: { role: 'user', parts: [{ text: prompt }] },
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

      return output || 'Não foi possível gerar uma resposta adequada.';
    } catch (error) {
      console.error(`[${this.role}] Error:`, error);
      return 'Desculpe, ocorreu um erro ao gerar a resposta.';
    }
  }

  private buildPrompt(context: AgentContext): string {
    const parts: string[] = [];

    parts.push(`User asked: "${context.userQuery}"\n`);

    if (context.interpretation) {
      parts.push(`Intent: ${context.interpretation.intent}\n`);
    }

    if (context.queryResults && context.queryResults.length > 0) {
      parts.push(`Database Results:\n${JSON.stringify(context.queryResults, null, 2)}\n`);
    }

    if (context.mcpResults) {
      parts.push(`External Data:\n${JSON.stringify(context.mcpResults, null, 2)}\n`);
    }

    if (context.predictResults?.summaryText) {
      parts.push(`Forecast Results:\n${context.predictResults.summaryText}\n`);
    }

    parts.push(`Generate a clear response in Portuguese based on the data above.`);

    return parts.join('\n');
  }
}
