import type { IAgent, AgentContext } from '../types/agent.types';
import { aiService } from '@infrastructure/ai/ai-service';

export class SuggestionAgent implements IAgent {
  role = 'suggestion' as const;

  async process(context: AgentContext): Promise<AgentContext> {
    const suggestions = await this.generateSuggestions(context);

    return {
      ...context,
      suggestions,
      conversationHistory: [
        ...context.conversationHistory,
        {
          role: 'assistant',
          content: `Sugestões: ${suggestions.join('; ')}`,
          metadata: {
            agent: 'suggestion',
            suggestions,
          },
        },
      ],
    };
  }

  private async generateSuggestions(context: AgentContext): Promise<string[]> {
    const prompt = `Você é um assistente especializado em sugerir próximas perguntas sobre dados de e-commerce.

Contexto da conversa:
Pergunta do usuário: "${context.userQuery}"
${context.interpretation ? `Intenção: ${context.interpretation.intent}` : ''}
${context.queryResults ? `Dados consultados: ${context.queryResults.length} registros` : ''}
${context.rawResponse ? `Resposta gerada: "${context.rawResponse.substring(0, 150)}..."` : ''}

IMPORTANTE: Baseado no contexto acima, sugira 3 perguntas RELEVANTES que o usuário pode querer fazer em seguida.

IDIOMA: Todas as sugestões DEVEM estar em PORTUGUÊS (pt-BR).

Diretrizes:
1. Sugestões devem ser perguntas completas e naturais
2. Relacionadas ao contexto da conversa atual
3. Explorar diferentes aspectos dos dados (análises complementares)
4. Variar entre perguntas simples e análises mais profundas
5. Focar em insights acionáveis

Exemplos de boas sugestões:
- "Quais são as 10 categorias com mais vendas?"
- "Como está a distribuição de clientes por região?"
- "Qual o ticket médio dos pedidos nos últimos 3 meses?"
- "Quais produtos têm melhor avaliação?"
- "Como está a taxa de entrega no prazo?"

Retorne APENAS as 3 perguntas, uma por linha, sem numeração ou markdown:`;

    const insights = await aiService.generateInsights({
      prompt,
      userQuery: context.userQuery,
      context,
    });

    const suggestionsText = insights[0] || '';
    const parsedSuggestions = this.parseSuggestions(suggestionsText);

    return parsedSuggestions.length > 0
      ? parsedSuggestions
      : this.getDefaultSuggestions(context);
  }

  private parseSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      const cleaned = line
        .replace(/^\d+[\.\)]\s*/, '')
        .replace(/^[-*•]\s*/, '')
        .replace(/^["']\s*/, '')
        .replace(/\s*["']$/, '')
        .trim();

      if (cleaned && cleaned.length > 10 && suggestions.length < 3) {
        if (
          cleaned.endsWith('?') ||
          cleaned.includes('qual') ||
          cleaned.includes('quantos')
        ) {
          suggestions.push(cleaned);
        }
      }
    }

    return suggestions;
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
