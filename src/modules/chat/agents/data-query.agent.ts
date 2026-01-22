import type { IAgent, AgentContext, QueryResult } from '../types/agent.types';
import { getDatabase } from '@infrastructure/database/connection';
import { aiService } from '@infrastructure/ai/ai-service';
import { sql } from 'drizzle-orm';

export class DataQueryAgent implements IAgent {
  role = 'data_query' as const;

  async process(context: AgentContext): Promise<AgentContext> {
    if (!context.interpretation?.requiresData) {
      return context;
    }

    const queryResult = await this.executeQuery(context);

    return {
      ...context,
      queryResults: queryResult.data,
      conversationHistory: [
        ...context.conversationHistory,
        {
          role: 'tool',
          content: `Consulta executada: ${queryResult.sql}`,
          metadata: {
            agent: 'data_query',
            rowCount: queryResult.data.length,
            summary: queryResult.summary,
          },
        },
      ],
    };
  }

  private async executeQuery(context: AgentContext): Promise<QueryResult> {
    const db = getDatabase();
    const schema = this.getDatabaseSchema();

    const sqlQuery = await this.generateSQL(
      context.userQuery,
      context.interpretation!,
      schema
    );

    try {
      const result = await db.execute(sql.raw(sqlQuery));
      const data = Array.isArray(result) ? result : [result];

      return {
        sql: sqlQuery,
        data,
        summary: `Encontrados ${data.length} registros`,
      };
    } catch (error) {
      console.error('Query execution error:', error);
      return {
        sql: sqlQuery,
        data: [],
        summary: 'Erro ao executar consulta',
      };
    }
  }

  private async generateSQL(
    userQuery: string,
    interpretation: { intent: string; entities: Record<string, unknown> },
    schema: string
  ): Promise<string> {
    const prompt = `Você é um especialista em SQL e banco de dados de e-commerce Olist.

Schema do banco de dados:
${schema}

Intenção do usuário: ${interpretation.intent}
Pergunta original: "${userQuery}"
Entidades identificadas: ${JSON.stringify(interpretation.entities)}

IMPORTANTE: Gere SQL que responda EXATAMENTE o que foi perguntado.

Exemplos:
- "Quais produtos temos?" → SELECT com categorias e contagem
- "Quantos clientes?" → SELECT COUNT com agrupamento
- "Faturamento total?" → SELECT SUM de valores
- "Top 10 categorias?" → SELECT com GROUP BY e ORDER BY

Retorne APENAS o SQL, sem explicações, comentários ou markdown.

Regras:
- Use LIMIT apropriado (20-50 para listagens, ilimitado para agregações)
- Use JOINs quando necessário para dados relacionados
- SEMPRE use agregações (COUNT, SUM, AVG) para perguntas de quantidade/total
- Para perguntas "quais/quantos", use GROUP BY com COUNT
- Ordene os resultados de forma relevante (DESC para rankings)
- Traduza categorias com product_category_name_translation quando possível
- Não use DROP, DELETE, UPDATE ou INSERT`;

    const insights = await aiService.generateInsights({
      prompt,
      userQuery,
      interpretation,
    });

    const sqlQuery = this.extractSQL(insights[0] || '');
    return sqlQuery || this.getFallbackQuery();
  }

  private extractSQL(text: string): string {
    const sqlMatch = text.match(/```sql\n([\s\S]*?)\n```/);
    if (sqlMatch) {
      return sqlMatch[1].trim();
    }

    const cleanText = text.trim();
    if (cleanText.toUpperCase().startsWith('SELECT')) {
      return cleanText;
    }

    return '';
  }

  private getFallbackQuery(): string {
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

  private getDatabaseSchema(): string {
    return `
-- Dataset Olist E-Commerce Brasil
-- Schema completo para análise de dados de e-commerce

-- Tabela de Tradução de Categorias
CREATE TABLE product_category_name_translation (
  product_category_name VARCHAR(100) PRIMARY KEY,
  product_category_name_english VARCHAR(100) NOT NULL
);

-- Tabela de Clientes
CREATE TABLE olist_customers (
  customer_id VARCHAR(50) PRIMARY KEY,
  customer_unique_id VARCHAR(50) NOT NULL,
  customer_zip_code_prefix VARCHAR(10) NOT NULL,
  customer_city VARCHAR(100) NOT NULL,
  customer_state VARCHAR(2) NOT NULL
);

-- Tabela de Vendedores
CREATE TABLE olist_sellers (
  seller_id VARCHAR(50) PRIMARY KEY,
  seller_zip_code_prefix VARCHAR(10) NOT NULL,
  seller_city VARCHAR(100) NOT NULL,
  seller_state VARCHAR(2) NOT NULL
);

-- Tabela de Produtos
CREATE TABLE olist_products (
  product_id VARCHAR(50) PRIMARY KEY,
  product_category_name VARCHAR(100),
  product_name_lenght INTEGER,
  product_description_lenght INTEGER,
  product_photos_qty INTEGER,
  product_weight_g INTEGER,
  product_length_cm INTEGER,
  product_height_cm INTEGER,
  product_width_cm INTEGER,
  FOREIGN KEY (product_category_name) REFERENCES product_category_name_translation(product_category_name)
);

-- Tabela de Pedidos
CREATE TABLE olist_orders (
  order_id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50) NOT NULL,
  order_status VARCHAR(20) NOT NULL,
  order_purchase_timestamp TIMESTAMP NOT NULL,
  order_approved_at TIMESTAMP,
  order_delivered_carrier_date TIMESTAMP,
  order_delivered_customer_date TIMESTAMP,
  order_estimated_delivery_date TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES olist_customers(customer_id)
);

-- Tabela de Itens do Pedido
CREATE TABLE olist_order_items (
  order_id VARCHAR(50) NOT NULL,
  order_item_id INTEGER NOT NULL,
  product_id VARCHAR(50) NOT NULL,
  seller_id VARCHAR(50) NOT NULL,
  shipping_limit_date TIMESTAMP NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  freight_value DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (order_id, order_item_id),
  FOREIGN KEY (order_id) REFERENCES olist_orders(order_id),
  FOREIGN KEY (product_id) REFERENCES olist_products(product_id),
  FOREIGN KEY (seller_id) REFERENCES olist_sellers(seller_id)
);

-- Tabela de Pagamentos
CREATE TABLE olist_order_payments (
  order_id VARCHAR(50) NOT NULL,
  payment_sequential INTEGER NOT NULL,
  payment_type VARCHAR(30) NOT NULL,
  payment_installments INTEGER NOT NULL,
  payment_value DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (order_id, payment_sequential),
  FOREIGN KEY (order_id) REFERENCES olist_orders(order_id)
);

-- Tabela de Avaliações
CREATE TABLE olist_order_reviews (
  review_id VARCHAR(50) PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  review_score INTEGER NOT NULL,
  review_comment_title TEXT,
  review_comment_message TEXT,
  review_creation_date TIMESTAMP NOT NULL,
  review_answer_timestamp TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES olist_orders(order_id)
);

-- Tabela de Geolocalização
CREATE TABLE olist_geolocation (
  id SERIAL PRIMARY KEY,
  geolocation_zip_code_prefix VARCHAR(10) NOT NULL,
  geolocation_lat DECIMAL(10, 8) NOT NULL,
  geolocation_lng DECIMAL(11, 8) NOT NULL,
  geolocation_city VARCHAR(100) NOT NULL,
  geolocation_state VARCHAR(2) NOT NULL
);

-- Principais campos para consultas:
-- Produtos: product_id, product_category_name, dimensões, peso
-- Clientes: customer_id, customer_city, customer_state
-- Pedidos: order_id, order_status, order_purchase_timestamp
-- Itens: price, freight_value, seller_id
-- Pagamentos: payment_type, payment_value, payment_installments
-- Avaliações: review_score, review_comment_message`;
  }
}
