import type { EvalCase } from '../types';

/**
 * Evaluation cases for the Agent Orchestrator
 * Tests end-to-end agent pipeline execution
 */
export const orchestratorEvalCases: EvalCase[] = [
  {
    id: 'orch-001',
    name: 'Complete simple query pipeline',
    description: 'Full pipeline for basic product query',
    input: {
      userQuery: 'Quais produtos temos?',
    },
    expected: {
      completes: true,
      noErrors: true,
      agentsRun: ['interpreter', 'data_query', 'responder'],
      answersQuestion: true,
      inPortuguese: true,
    },
    tags: ['orchestrator', 'end-to-end', 'basic'],
  },
  {
    id: 'orch-002',
    name: 'Complete customer count pipeline',
    description: 'Full pipeline for customer counting',
    input: {
      userQuery: 'Quantos clientes temos por estado?',
    },
    expected: {
      completes: true,
      noErrors: true,
      hasResults: true,
      answersQuestion: true,
      responseContains: ['cliente', 'estado'],
    },
    tags: ['orchestrator', 'end-to-end', 'aggregation'],
  },
  {
    id: 'orch-003',
    name: 'Complete revenue analysis',
    description: 'Full pipeline for revenue calculation',
    input: {
      userQuery: 'Qual o faturamento total do e-commerce?',
    },
    expected: {
      completes: true,
      noErrors: true,
      sqlContains: ['SUM', 'payment_value'],
      answersQuestion: true,
      responseContains: ['faturamento'],
    },
    tags: ['orchestrator', 'end-to-end', 'revenue'],
  },
  {
    id: 'orch-004',
    name: 'Complete ranking query',
    description: 'Full pipeline for top categories',
    input: {
      userQuery: 'Top 10 categorias mais vendidas',
    },
    expected: {
      completes: true,
      noErrors: true,
      sqlContains: ['ORDER BY', 'LIMIT'],
      answersQuestion: true,
      responseContains: ['categoria'],
    },
    tags: ['orchestrator', 'end-to-end', 'ranking'],
  },
  {
    id: 'orch-005',
    name: 'Handle ambiguous query',
    description: 'Pipeline should handle unclear questions',
    input: {
      userQuery: 'Me mostre alguma coisa interessante',
    },
    expected: {
      completes: true,
      noErrors: true,
      answersQuestion: true,
    },
    tags: ['orchestrator', 'edge-case', 'ambiguous'],
  },
  {
    id: 'orch-006',
    name: 'With conversation history',
    description: 'Pipeline with context from previous messages',
    input: {
      userQuery: 'E qual a média de avaliação?',
      conversationHistory: [
        {
          role: 'user',
          content: 'Quantos produtos temos?',
        },
        {
          role: 'assistant',
          content: 'Temos 32,951 produtos no catálogo.',
        },
      ],
    },
    expected: {
      completes: true,
      noErrors: true,
      answersQuestion: true,
      responseContains: ['avaliação'],
    },
    tags: ['orchestrator', 'context', 'conversation'],
  },
  {
    id: 'orch-007',
    name: 'Complex multi-table query',
    description: 'Pipeline for complex analysis requiring multiple joins',
    input: {
      userQuery: 'Qual a receita média por categoria de produto?',
    },
    expected: {
      completes: true,
      noErrors: true,
      sqlContains: ['JOIN', 'AVG', 'GROUP BY'],
      answersQuestion: true,
    },
    tags: ['orchestrator', 'end-to-end', 'complex', 'joins'],
  },
  {
    id: 'orch-008',
    name: 'Temporal analysis',
    description: 'Pipeline for time-based queries',
    input: {
      userQuery: 'Quantas vendas tivemos em 2017?',
    },
    expected: {
      completes: true,
      noErrors: true,
      sqlContains: ['2017', 'WHERE'],
      answersQuestion: true,
    },
    tags: ['orchestrator', 'end-to-end', 'temporal'],
  },
  {
    id: 'orch-009',
    name: 'Geographic analysis',
    description: 'Pipeline for location-based queries',
    input: {
      userQuery: 'Quais estados têm mais vendas?',
    },
    expected: {
      completes: true,
      noErrors: true,
      sqlContains: ['state', 'GROUP BY'],
      answersQuestion: true,
      responseContains: ['estado'],
    },
    tags: ['orchestrator', 'end-to-end', 'geography'],
  },
  {
    id: 'orch-010',
    name: 'Payment analysis',
    description: 'Pipeline for payment method analysis',
    input: {
      userQuery: 'Qual o método de pagamento mais usado?',
    },
    expected: {
      completes: true,
      noErrors: true,
      answersQuestion: true,
      responseContains: ['pagamento'],
    },
    tags: ['orchestrator', 'end-to-end', 'payments'],
  },
  {
    id: 'orch-011',
    name: 'Review analysis',
    description: 'Pipeline for customer review analysis',
    input: {
      userQuery: 'Qual a nota média das avaliações?',
    },
    expected: {
      completes: true,
      noErrors: true,
      sqlContains: ['AVG', 'review_score'],
      answersQuestion: true,
    },
    tags: ['orchestrator', 'end-to-end', 'reviews'],
  },
  {
    id: 'orch-012',
    name: 'Multilingual handling',
    description: 'Pipeline should handle English input',
    input: {
      userQuery: 'How many products are there?',
    },
    expected: {
      completes: true,
      noErrors: true,
      answersQuestion: true,
      inPortuguese: true,
    },
    tags: ['orchestrator', 'end-to-end', 'multilingual'],
  },
  {
    id: 'orch-013',
    name: 'Suggestions generation',
    description: 'Pipeline should generate follow-up suggestions',
    input: {
      userQuery: 'Mostre dados de vendas',
    },
    expected: {
      completes: true,
      noErrors: true,
      suggestionCount: 3,
    },
    tags: ['orchestrator', 'suggestions', 'end-to-end'],
  },
  {
    id: 'orch-014',
    name: 'Error resilience',
    description: 'Pipeline should handle errors gracefully',
    input: {
      userQuery: 'SELECT * FROM nonexistent_table',
    },
    expected: {
      completes: true,
      answersQuestion: true,
    },
    tags: ['orchestrator', 'error-handling', 'edge-case'],
  },
];
