import type { IAgent, AgentContext } from '../types/agent.types';
import { aiService } from '@infrastructure/ai/ai-service';

export class ResponderAgent implements IAgent {
  role = 'responder' as const;

  async process(context: AgentContext): Promise<AgentContext> {
    const response = await this.generateResponse(context);

    return {
      ...context,
      rawResponse: response,
      conversationHistory: [
        ...context.conversationHistory,
        {
          role: 'assistant',
          content: response,
          metadata: { agent: 'responder' },
        },
      ],
    };
  }

  private async generateResponse(context: AgentContext): Promise<string> {
    const hasData = context.queryResults && context.queryResults.length > 0;

    const prompt = `Você é um assistente especializado em análise de dados de e-commerce Olist.

PERGUNTA ORIGINAL DO USUÁRIO: "${context.userQuery}"

${context.interpretation ? `Interpretação: ${context.interpretation.intent}` : ''}

${hasData ? `Dados encontrados:\n${JSON.stringify(context.queryResults, null, 2)}` : 'Nenhum dado disponível.'}

IMPORTANTE: Responda EXATAMENTE o que foi perguntado. Não desvie do assunto.

IDIOMA: Responda SEMPRE em PORTUGUÊS (pt-BR), independente do idioma da pergunta.

Diretrizes:
- Responda DIRETAMENTE a pergunta feita
- Se perguntaram "quais produtos", liste produtos ou categorias
- Se perguntaram "quantos", dê o número total
- Se perguntaram "faturamento", foque em valores monetários
- Use números e estatísticas dos dados retornados
- Se houver muitos registros, resuma os principais (top 5-10)
- Seja conversacional mas FOCADO na pergunta
- NÃO invente informações que não estão nos dados
- NÃO desvie para análises não solicitadas
- SEMPRE use português brasileiro na resposta`;

    const insights = await aiService.generateInsights({
      prompt,
      context,
    });

    return insights[0] || 'Não foi possível gerar uma resposta adequada.';
  }
}
