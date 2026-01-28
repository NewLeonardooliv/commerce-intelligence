import type { EvalCase } from '../types';

/**
 * Evaluation cases for the Responder Agent
 * Tests response generation quality and relevance
 */
export const responderEvalCases: EvalCase[] = [
  {
    id: 'resp-001',
    name: 'Answer product category question',
    description: 'Generate response about product categories',
    input: {
      userQuery: 'Quais categorias de produtos temos?',
    },
    expected: {
      responseContains: ['categoria'],
      answersQuestion: true,
      inPortuguese: true,
      responseLength: { min: 50 },
    },
    tags: ['responder', 'basic', 'products'],
  },
  {
    id: 'resp-002',
    name: 'Answer with specific numbers',
    description: 'Response should include numerical data',
    input: {
      userQuery: 'Quantos clientes temos?',
    },
    expected: {
      responseContains: ['cliente'],
      answersQuestion: true,
      inPortuguese: true,
      responseLength: { min: 30 },
    },
    tags: ['responder', 'basic', 'customers', 'numbers'],
  },
  {
    id: 'resp-003',
    name: 'Answer revenue question',
    description: 'Response should mention revenue/money',
    input: {
      userQuery: 'Qual o faturamento total?',
    },
    expected: {
      responseContains: ['faturamento'],
      answersQuestion: true,
      inPortuguese: true,
    },
    tags: ['responder', 'basic', 'revenue'],
  },
  {
    id: 'resp-004',
    name: 'Answer ranking question',
    description: 'Should provide ordered list/ranking',
    input: {
      userQuery: 'Quais são as top 5 categorias?',
    },
    expected: {
      responseContains: ['categoria'],
      answersQuestion: true,
      inPortuguese: true,
      responseLength: { min: 100 },
    },
    tags: ['responder', 'intermediate', 'ranking'],
  },
  {
    id: 'resp-005',
    name: 'Handle empty results gracefully',
    description: 'Should handle cases with no data',
    input: {
      userQuery: 'Quantos produtos custam mais de 1 milhão?',
    },
    expected: {
      answersQuestion: true,
      inPortuguese: true,
      responseNotContains: ['erro', 'falha'],
    },
    tags: ['responder', 'edge-case', 'no-data'],
  },
  {
    id: 'resp-006',
    name: 'Conversational tone',
    description: 'Response should be natural and conversational',
    input: {
      userQuery: 'Me fale sobre os produtos',
    },
    expected: {
      answersQuestion: true,
      inPortuguese: true,
      responseLength: { min: 80 },
      responseNotContains: ['SELECT', 'SQL', 'query'],
    },
    tags: ['responder', 'basic', 'tone'],
  },
  {
    id: 'resp-007',
    name: 'Portuguese response for English query',
    description: 'Should always respond in Portuguese',
    input: {
      userQuery: 'How many orders do we have?',
    },
    expected: {
      inPortuguese: true,
      answersQuestion: true,
      responseContains: ['pedido'],
    },
    tags: ['responder', 'multilingual'],
  },
  {
    id: 'resp-008',
    name: 'Summarize large datasets',
    description: 'Should summarize when there are many results',
    input: {
      userQuery: 'Liste todos os produtos',
    },
    expected: {
      answersQuestion: true,
      inPortuguese: true,
      responseLength: { min: 50, max: 1000 },
    },
    tags: ['responder', 'intermediate', 'summarization'],
  },
  {
    id: 'resp-009',
    name: 'Include relevant statistics',
    description: 'Should mention key statistics from data',
    input: {
      userQuery: 'Análise das vendas por estado',
    },
    expected: {
      answersQuestion: true,
      inPortuguese: true,
      responseContains: ['estado'],
    },
    tags: ['responder', 'advanced', 'statistics'],
  },
  {
    id: 'resp-010',
    name: 'Direct answer to specific question',
    description: 'Should directly answer what was asked',
    input: {
      userQuery: 'Qual categoria tem mais produtos?',
    },
    expected: {
      answersQuestion: true,
      inPortuguese: true,
      responseContains: ['categoria'],
      responseLength: { min: 40 },
    },
    tags: ['responder', 'basic', 'direct'],
  },
  {
    id: 'resp-011',
    name: 'No hallucination',
    description: 'Should not invent data that is not in results',
    input: {
      userQuery: 'Qual o produto mais caro?',
    },
    expected: {
      answersQuestion: true,
      inPortuguese: true,
      responseNotContains: ['não sei', 'não foi possível'],
    },
    tags: ['responder', 'advanced', 'accuracy'],
  },
  {
    id: 'resp-012',
    name: 'Context-aware response',
    description: 'Should use interpretation context',
    input: {
      userQuery: 'Detalhes sobre pagamentos',
    },
    expected: {
      answersQuestion: true,
      inPortuguese: true,
      responseContains: ['pagamento'],
      responseLength: { min: 60 },
    },
    tags: ['responder', 'intermediate', 'context'],
  },
];
