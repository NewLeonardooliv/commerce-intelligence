import type { IAgent, AgentContext, InterpretationResult } from '../types/agent.types';
import { aiService } from '@infrastructure/ai/ai-service';

export class InterpreterAgent implements IAgent {
  role = 'interpreter' as const;

  async process(context: AgentContext): Promise<AgentContext> {
    const interpretation = await this.interpretQuery(context.userQuery);

    return {
      ...context,
      interpretation,
      conversationHistory: [
        ...context.conversationHistory,
        {
          role: 'assistant',
          content: `Interpretação: ${interpretation.intent}`,
          metadata: { agent: 'interpreter', interpretation },
        },
      ],
    };
  }

  private async interpretQuery(query: string): Promise<InterpretationResult> {
    const prompt = `Você é um agente especializado em interpretar consultas sobre dados de e-commerce Olist.

Dataset Olist contém:
- Produtos: categorias, dimensões, peso
- Clientes: localização (cidade, estado)
- Pedidos: status, valores, datas
- Pagamentos: tipos, parcelas, valores
- Avaliações: scores, comentários
- Vendedores: localização

Analise a pergunta e extraia:
1. Intenção principal (ex: "Listar produtos disponíveis por categoria")
2. Entidades mencionadas (categorias, períodos, estados, métricas)
3. Se requer consulta ao banco (quase sempre TRUE)
4. Nível de confiança da interpretação

IMPORTANTE: Seja específico na intenção!
- "Quais produtos temos?" → "Listar produtos ou categorias disponíveis no catálogo"
- "Quantos clientes?" → "Contar total de clientes e agrupar por estado"
- "Faturamento?" → "Calcular soma total de vendas"

IDIOMA: A interpretação (campo "intent") deve estar em PORTUGUÊS, independente do idioma da pergunta.

Pergunta: "${query}"

Responda APENAS com JSON puro, sem markdown:
{
  "intent": "descrição específica da intenção EM PORTUGUÊS",
  "entities": { "key": "value" },
  "requiresData": true/false,
  "suggestedQueries": [],
  "confidence": 0.0-1.0
}`;

    const insights = await aiService.generateInsights({ query, prompt });

    try {
      const result = this.parseInterpretation(insights[0] || '{}');
      return result;
    } catch {
      return {
        intent: 'Análise geral de dados de e-commerce',
        entities: {},
        requiresData: true,
        suggestedQueries: [],
        confidence: 0.5,
      };
    }
  }

  private parseInterpretation(text: string): InterpretationResult {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      intent: text,
      entities: {},
      requiresData: true,
      suggestedQueries: [],
      confidence: 0.7,
    };
  }
}
