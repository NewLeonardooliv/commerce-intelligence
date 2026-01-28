import type { EvalCase } from '../types';

/**
 * Evaluation cases for the Interpreter Agent
 * Tests the agent's ability to understand user queries and extract intent
 */
export const interpreterEvalCases: EvalCase[] = [
  {
    id: 'interp-001',
    name: 'Simple product listing query',
    description: 'User asks for available products',
    input: {
      userQuery: 'Quais produtos temos disponíveis?',
    },
    expected: {
      intentContains: ['produto', 'listar'],
      confidence: { min: 0.7 },
      requiresData: true,
    },
    tags: ['interpreter', 'basic', 'products'],
  },
  {
    id: 'interp-002',
    name: 'Customer count query',
    description: 'User asks how many customers',
    input: {
      userQuery: 'Quantos clientes temos?',
    },
    expected: {
      intentContains: ['cliente', 'contar'],
      confidence: { min: 0.7 },
      requiresData: true,
    },
    tags: ['interpreter', 'basic', 'customers'],
  },
  {
    id: 'interp-003',
    name: 'Revenue query',
    description: 'User asks about total revenue',
    input: {
      userQuery: 'Qual o faturamento total?',
    },
    expected: {
      intentContains: ['faturamento', 'total'],
      confidence: { min: 0.7 },
      requiresData: true,
    },
    tags: ['interpreter', 'basic', 'revenue'],
  },
  {
    id: 'interp-004',
    name: 'Top categories query',
    description: 'User asks for top selling categories',
    input: {
      userQuery: 'Quais são as top 10 categorias mais vendidas?',
    },
    expected: {
      intentContains: ['categoria', 'top'],
      confidence: { min: 0.7 },
      requiresData: true,
      entities: {
        limit: 10,
      },
    },
    tags: ['interpreter', 'intermediate', 'categories'],
  },
  {
    id: 'interp-005',
    name: 'Regional sales query',
    description: 'User asks about sales by region',
    input: {
      userQuery: 'Quais estados têm mais vendas?',
    },
    expected: {
      intentContains: ['estado', 'venda'],
      confidence: { min: 0.7 },
      requiresData: true,
    },
    tags: ['interpreter', 'intermediate', 'geography'],
  },
  {
    id: 'interp-006',
    name: 'Complex aggregation query',
    description: 'User asks for average rating by category',
    input: {
      userQuery: 'Qual a avaliação média dos produtos por categoria?',
    },
    expected: {
      intentContains: ['avaliação', 'média', 'categoria'],
      confidence: { min: 0.6 },
      requiresData: true,
    },
    tags: ['interpreter', 'advanced', 'reviews', 'aggregation'],
  },
  {
    id: 'interp-007',
    name: 'Time-based query',
    description: 'User asks about sales in a specific period',
    input: {
      userQuery: 'Quantas vendas tivemos em 2017?',
    },
    expected: {
      intentContains: ['venda', '2017'],
      confidence: { min: 0.7 },
      requiresData: true,
      entities: {
        year: 2017,
      },
    },
    tags: ['interpreter', 'intermediate', 'temporal'],
  },
  {
    id: 'interp-008',
    name: 'Comparison query',
    description: 'User asks to compare payment methods',
    input: {
      userQuery: 'Qual método de pagamento é mais usado?',
    },
    expected: {
      intentContains: ['pagamento', 'método'],
      confidence: { min: 0.7 },
      requiresData: true,
    },
    tags: ['interpreter', 'intermediate', 'payments'],
  },
  {
    id: 'interp-009',
    name: 'Ambiguous query',
    description: 'User asks a vague question',
    input: {
      userQuery: 'Me mostre dados',
    },
    expected: {
      confidence: { min: 0.3, max: 0.6 },
      requiresData: true,
    },
    tags: ['interpreter', 'edge-case', 'ambiguous'],
  },
  {
    id: 'interp-010',
    name: 'English query with Portuguese response',
    description: 'User asks in English, should interpret in Portuguese',
    input: {
      userQuery: 'How many orders do we have?',
    },
    expected: {
      intentContains: ['pedido'],
      confidence: { min: 0.6 },
      requiresData: true,
      inPortuguese: true,
    },
    tags: ['interpreter', 'multilingual', 'orders'],
  },
  {
    id: 'interp-011',
    name: 'Requires external tools',
    description: 'Query that might need MCP tools',
    input: {
      userQuery: 'Buscar na web sobre e-commerce brasileiro',
    },
    expected: {
      requiresExternalTools: true,
      confidence: { min: 0.5 },
    },
    tags: ['interpreter', 'mcp', 'external'],
  },
  {
    id: 'interp-012',
    name: 'Multi-entity query',
    description: 'Query with multiple entities',
    input: {
      userQuery: 'Quantos pedidos de SP foram entregues em dezembro?',
    },
    expected: {
      intentContains: ['pedido', 'entregue'],
      confidence: { min: 0.6 },
      requiresData: true,
    },
    tags: ['interpreter', 'advanced', 'multi-entity'],
  },
];
