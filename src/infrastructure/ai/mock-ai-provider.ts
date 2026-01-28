import type { AiCompletionRequest, AiCompletionResponse, IAiProvider } from './ai-provider.interface';
import type { AgentMessage } from '@modules/chat/types/agent.types';

/**
 * Mock AI Provider for testing
 * Returns realistic mock responses for different types of queries
 */
export class MockAiProvider implements IAiProvider {
  complete(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    throw new Error('Method not implemented.');
  }
  analyzeData(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    throw new Error('Method not implemented.');
  }
  async generateText(messages: AgentMessage[]): Promise<string> {
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage?.content?.toLowerCase() || '';

    // Mock interpreter responses
    if (content.includes('interpretar') || content.includes('intenção')) {
      if (content.includes('produtos')) {
        return JSON.stringify({
          intent: 'Listar produtos ou categorias disponíveis no catálogo',
          entities: { type: 'products' },
          requiresData: true,
          suggestedQueries: ['Quantos produtos temos?', 'Quais categorias existem?'],
          confidence: 0.9,
        });
      }

      if (content.includes('clientes')) {
        return JSON.stringify({
          intent: 'Contar total de clientes e agrupar por estado',
          entities: { type: 'customers', groupBy: 'state' },
          requiresData: true,
          suggestedQueries: ['Clientes por cidade', 'Total de clientes'],
          confidence: 0.85,
        });
      }

      if (content.includes('faturamento')) {
        return JSON.stringify({
          intent: 'Calcular soma total de vendas (faturamento)',
          entities: { metric: 'revenue', aggregation: 'sum' },
          requiresData: true,
          suggestedQueries: ['Faturamento por mês', 'Faturamento por categoria'],
          confidence: 0.9,
        });
      }

      // Default interpretation
      return JSON.stringify({
        intent: 'Análise geral de dados de e-commerce',
        entities: {},
        requiresData: true,
        suggestedQueries: [],
        confidence: 0.6,
      });
    }

    // Mock SQL generation
    if (content.includes('gere sql') || content.includes('schema do banco')) {
      if (content.includes('produtos') || content.includes('categorias')) {
        return `
          SELECT 
            pct.product_category_name_english as category,
            COUNT(*) as total_products
          FROM olist_products p
          LEFT JOIN product_category_name_translation pct 
            ON p.product_category_name = pct.product_category_name
          GROUP BY pct.product_category_name_english
          ORDER BY total_products DESC
          LIMIT 20
        `;
      }

      if (content.includes('clientes')) {
        return `
          SELECT 
            customer_state,
            COUNT(DISTINCT customer_id) as total_customers
          FROM olist_customers
          GROUP BY customer_state
          ORDER BY total_customers DESC
        `;
      }

      if (content.includes('faturamento')) {
        return `
          SELECT 
            SUM(payment_value) as total_revenue
          FROM olist_order_payments
        `;
      }

      // Default query
      return `
        SELECT COUNT(*) as total FROM olist_orders
      `;
    }

    // Mock response generation
    if (content.includes('assistente especializado em análise')) {
      const query = content.match(/pergunta original do usuário: "(.+?)"/i)?.[1] || '';

      if (query.toLowerCase().includes('produto')) {
        return 'Temos diversas categorias de produtos no nosso catálogo de e-commerce. As principais categorias incluem eletrônicos, casa e jardim, esportes e lazer, entre outras. No total, contamos com milhares de produtos distribuídos em mais de 70 categorias diferentes.';
      }

      if (query.toLowerCase().includes('cliente')) {
        return 'Nosso e-commerce possui clientes distribuídos por todo o Brasil. A maioria está concentrada nos estados de São Paulo, Rio de Janeiro e Minas Gerais, que juntos representam mais de 50% da nossa base de clientes. No total, temos clientes ativos em todos os estados brasileiros.';
      }

      if (query.toLowerCase().includes('faturamento')) {
        return 'O faturamento total do e-commerce representa a soma de todos os valores de pagamentos processados. Com base nos dados disponíveis, podemos analisar o desempenho financeiro em diferentes períodos e categorias de produtos.';
      }

      // Default response
      return 'Com base nos dados analisados, posso fornecer informações sobre produtos, clientes, pedidos e vendas do nosso e-commerce. Os dados mostram um panorama completo das operações do marketplace.';
    }

    // Mock tool decision
    if (content.includes('decidir qual ferramenta mcp')) {
      return JSON.stringify({
        toolName: null,
      });
    }

    // Default response
    return 'Mock AI response for testing purposes.';
  }

  async generateInsights(params: {
    query?: string;
    prompt?: string;
    context?: any;
    userQuery?: string;
    interpretation?: any;
  }): Promise<string[]> {
    const text = await this.generateText([
      {
        role: 'user',
        content: params.prompt || params.query || params.userQuery || '',
      },
    ]);
    return [text];
  }

  async generateStructuredOutput<T>(messages: AgentMessage[], schema: any): Promise<T> {
    const text = await this.generateText(messages);
    try {
      return JSON.parse(text) as T;
    } catch {
      return {} as T;
    }
  }
}
