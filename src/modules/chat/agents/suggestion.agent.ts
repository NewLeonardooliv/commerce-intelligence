import type { IAgent, AgentContext } from '../types/agent.types';
import { LlmAgent, InMemoryRunner } from '@google/adk';

export class SuggestionAgent implements IAgent {
  role = 'suggestion' as const;
  private adkAgent: LlmAgent;

  constructor() {
    this.adkAgent = new LlmAgent({
      name: 'suggestion',
      description: 'Generates follow-up question suggestions',
      model: 'gemini-2.5-flash',
      instruction: `You are a suggestion generator for e-commerce analytics.

Your task: Create 3 relevant follow-up questions in Portuguese based on the current conversation.

IMPORTANT:
- Return ONLY 3 questions, one per line
- Questions should be complete and natural
- Use Portuguese (pt-BR)
- No numbering, bullets, or markdown
- Questions should explore different aspects of the data`,
    });
  }

  async process(context: AgentContext): Promise<AgentContext> {
    // Skip if no response yet
    if (!context.rawResponse) {
      console.log(`[${this.role}] Skipping - no response to base suggestions on`);
      return context;
    }

    console.log(`[${this.role}] Generating suggestions...`);

    const suggestions = await this.generateSuggestions(context);

    console.log(`[${this.role}] Suggestions generated:`, suggestions);

    return {
      ...context,
      suggestions,
    };
  }

  private async generateSuggestions(context: AgentContext): Promise<string[]> {
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

      return this.parseSuggestions(output, context);
    } catch (error) {
      console.error(`[${this.role}] Error:`, error);
      return this.getDefaultSuggestions(context);
    }
  }

  private buildPrompt(context: AgentContext): string {
    const parts: string[] = [];

    parts.push(`User asked: "${context.userQuery}"\n`);

    if (context.rawResponse) {
      parts.push(`Response given: "${context.rawResponse}"\n`);
    }

    parts.push(`Generate 3 relevant follow-up questions in Portuguese, one per line, no formatting.`);

    return parts.join('\n');
  }

  private parseSuggestions(output: string, context: AgentContext): string[] {
    const lines = output.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 10)
      .map(line => {
        // Remove numbering (1., 1), 2., etc)
        let cleaned = line.replace(/^\d+[\.\)]\s*/, '');
        // Remove bullets
        cleaned = cleaned.replace(/^[-*•]\s*/, '');
        // Remove quotes
        cleaned = cleaned.replace(/^["']\s*/, '').replace(/\s*["']$/, '');
        return cleaned.trim();
      })
      .filter(line => line.length > 0);

    const suggestions = lines.slice(0, 3);

    return suggestions.length > 0 ? suggestions : this.getDefaultSuggestions(context);
  }

  private getDefaultSuggestions(context: AgentContext): string[] {
    const userQuery = context.userQuery.toLowerCase();

    if (userQuery.includes('produto')) {
      return [
        'Quais são as categorias de produtos mais vendidas?',
        'Qual o ticket médio por categoria de produto?',
        'Como está a distribuição de estoque por categoria?',
      ];
    }

    if (userQuery.includes('cliente')) {
      return [
        'Como está a distribuição de clientes por estado?',
        'Quais estados têm maior número de clientes?',
        'Qual o perfil de compra dos clientes por região?',
      ];
    }

    if (userQuery.includes('pedido') || userQuery.includes('venda')) {
      return [
        'Qual foi o faturamento total de vendas?',
        'Como está a taxa de conversão de pedidos?',
        'Quais são os horários de pico de vendas?',
      ];
    }

    if (userQuery.includes('pagamento')) {
      return [
        'Quais são os métodos de pagamento mais utilizados?',
        'Qual a média de parcelas por pedido?',
        'Como está a distribuição de valores de pagamento?',
      ];
    }

    if (userQuery.includes('avalia') || userQuery.includes('review')) {
      return [
        'Qual a avaliação média dos produtos?',
        'Quais categorias têm melhor avaliação?',
        'Quantas avaliações negativas temos?',
      ];
    }

    return [
      'Quais são as principais tendências de vendas?',
      'Como está o desempenho geral do e-commerce?',
      'Quais insights podemos extrair dos dados recentes?',
    ];
  }
}
