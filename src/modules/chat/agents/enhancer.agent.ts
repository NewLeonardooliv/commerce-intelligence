import type { IAgent, AgentContext, EnhancedResponse } from '../types/agent.types';
import { aiService } from '@infrastructure/ai/ai-service';

export class EnhancerAgent implements IAgent {
  role = 'enhancer' as const;

  async process(context: AgentContext): Promise<AgentContext> {
    if (!context.rawResponse) {
      return context;
    }

    const enhanced = await this.enhanceResponse(context);

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
    const prompt = `Você é um editor especializado em melhorar respostas sobre dados de negócios.

Resposta original:
"${context.rawResponse}"

Dados utilizados: ${context.queryResults ? 'Sim' : 'Não'}

IDIOMA: A resposta DEVE ser SEMPRE em PORTUGUÊS (pt-BR), independente do idioma original.

Melhore esta resposta seguindo estas diretrizes:
1. Torne mais clara e estruturada em PORTUGUÊS
2. Adicione formatação apropriada (se aplicável)
3. Destaque métricas importantes
4. Mantenha tom profissional mas acessível
5. Se a resposta original estiver em outro idioma, TRADUZA para português brasileiro

Retorne APENAS a resposta melhorada em português brasileiro.`;

    const insights = await aiService.generateInsights({
      prompt,
      rawResponse: context.rawResponse,
      context,
    });

    const enhancedText = insights[0] || context.rawResponse!;

    return {
      content: enhancedText,
      sources: this.extractSources(context),
      confidence: this.calculateConfidence(context),
      suggestions: context.suggestions || [],
    };
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
