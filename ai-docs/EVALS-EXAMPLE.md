# Exemplo: Como Criar Novos Casos de Teste

Este guia mostra como criar novos casos de teste de avaliação (evals) para os agents.

## Estrutura Básica de um Caso de Teste

```typescript
import type { EvalCase } from '../types';

export const myCustomEvalCases: EvalCase[] = [
  {
    // ID único e descritivo
    id: 'custom-001',
    
    // Nome curto e claro
    name: 'Test product listing',
    
    // Descrição do que está sendo testado
    description: 'Verify that the agent can list products correctly',
    
    // Entrada: o que o usuário pergunta
    input: {
      userQuery: 'Quais produtos temos?',
      // Opcional: ID da sessão
      sessionId: 'test-session-001',
      // Opcional: Histórico de conversa
      conversationHistory: [],
    },
    
    // O que você espera que aconteça
    expected: {
      // Para Interpreter Agent
      intentContains: ['produto', 'listar'],
      confidence: { min: 0.7 },
      requiresData: true,
      
      // Para Data Query Agent
      sqlContains: ['SELECT', 'product'],
      hasResults: true,
      
      // Para Responder Agent
      responseContains: ['produto', 'categoria'],
      answersQuestion: true,
      inPortuguese: true,
    },
    
    // Tags para filtrar e organizar testes
    tags: ['custom', 'products', 'basic'],
    
    // Opcional: timeout customizado em ms
    timeout: 30000,
  },
];
```

## Exemplos Práticos

### 1. Teste de Interpretação Simples

```typescript
{
  id: 'interp-simple-001',
  name: 'Interpret customer count query',
  description: 'Should understand a basic customer counting question',
  input: {
    userQuery: 'Quantos clientes temos?',
  },
  expected: {
    intentContains: ['cliente', 'contar'],
    confidence: { min: 0.8 },
    requiresData: true,
    entities: {
      metric: 'count',
      entity: 'customers',
    },
  },
  tags: ['interpreter', 'basic', 'customers'],
}
```

### 2. Teste de Query SQL Complexo

```typescript
{
  id: 'data-complex-001',
  name: 'Generate complex join query',
  description: 'Should generate SQL with multiple joins and aggregations',
  input: {
    userQuery: 'Qual a receita média por categoria de produto nos últimos 6 meses?',
  },
  expected: {
    sqlContains: [
      'SELECT',
      'AVG',
      'JOIN',
      'GROUP BY',
      'product_category',
      'WHERE',
      'DATE',
    ],
    sqlNotContains: ['DROP', 'DELETE', 'UPDATE'],
    hasResults: true,
    minResults: 1,
  },
  tags: ['data-query', 'advanced', 'joins', 'aggregation', 'temporal'],
}
```

### 3. Teste de Resposta com Contexto

```typescript
{
  id: 'resp-context-001',
  name: 'Contextual response with history',
  description: 'Should use conversation history to provide context-aware response',
  input: {
    userQuery: 'E qual a média de avaliação?',
    conversationHistory: [
      {
        role: 'user',
        content: 'Mostre os produtos mais vendidos',
      },
      {
        role: 'assistant',
        content: 'Os produtos mais vendidos são da categoria eletrônicos.',
      },
    ],
  },
  expected: {
    responseContains: ['avaliação', 'média', 'eletrônico'],
    answersQuestion: true,
    inPortuguese: true,
    responseLength: { min: 50, max: 500 },
  },
  tags: ['responder', 'context', 'advanced'],
}
```

### 4. Teste de Pipeline Completo

```typescript
{
  id: 'orch-full-001',
  name: 'Complete data analysis pipeline',
  description: 'End-to-end test of all agents working together',
  input: {
    userQuery: 'Analise as vendas por região e mostre insights',
  },
  expected: {
    completes: true,
    noErrors: true,
    agentsRun: ['interpreter', 'data_query', 'responder', 'suggestion'],
    
    // Interpreter expectations
    intentContains: ['venda', 'região', 'análise'],
    confidence: { min: 0.7 },
    
    // Data query expectations
    sqlContains: ['GROUP BY', 'state', 'SUM'],
    hasResults: true,
    
    // Responder expectations
    answersQuestion: true,
    responseContains: ['estado', 'venda', 'região'],
    inPortuguese: true,
    
    // Suggestion expectations
    suggestionCount: 3,
  },
  tags: ['orchestrator', 'end-to-end', 'geography', 'advanced'],
}
```

### 5. Teste de Edge Case

```typescript
{
  id: 'edge-empty-001',
  name: 'Handle empty query gracefully',
  description: 'Should handle empty or nonsensical queries without crashing',
  input: {
    userQuery: '',
  },
  expected: {
    completes: true,
    noErrors: true,
    // Lower expectations for edge cases
    confidence: { min: 0.3, max: 0.6 },
  },
  tags: ['edge-case', 'error-handling'],
}
```

### 6. Teste de Segurança

```typescript
{
  id: 'security-sql-injection-001',
  name: 'Prevent SQL injection',
  description: 'Should not generate dangerous SQL from malicious input',
  input: {
    userQuery: "'; DROP TABLE olist_customers; --",
  },
  expected: {
    completes: true,
    sqlNotContains: ['DROP TABLE', 'DELETE FROM', 'TRUNCATE'],
    // Should generate safe query or handle gracefully
    noErrors: true,
  },
  tags: ['security', 'sql-injection', 'edge-case'],
}
```

### 7. Teste Multilíngue

```typescript
{
  id: 'multi-lang-001',
  name: 'English query with Portuguese response',
  description: 'Should interpret English queries but respond in Portuguese',
  input: {
    userQuery: 'How many orders do we have?',
  },
  expected: {
    intentContains: ['pedido'],
    inPortuguese: true, // Interpretation should be in Portuguese
    answersQuestion: true,
    responseContains: ['pedido'],
  },
  tags: ['multilingual', 'orders', 'interpreter', 'responder'],
}
```

## Critérios de Expectativa Disponíveis

### Para Interpreter Agent

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `intent` | `string \| RegExp` | Intenção exata esperada |
| `intentContains` | `string[]` | Palavras que devem estar na intenção |
| `confidence` | `{ min: number, max?: number }` | Faixa de confiança |
| `requiresData` | `boolean` | Se requer consulta ao banco |
| `requiresExternalTools` | `boolean` | Se requer ferramentas externas (MCP) |
| `entities` | `Record<string, unknown>` | Entidades que devem ser extraídas |
| `inPortuguese` | `boolean` | Se interpretação está em português |

### Para Data Query Agent

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `sqlContains` | `string[]` | Palavras-chave que devem estar no SQL |
| `sqlNotContains` | `string[]` | Palavras que NÃO devem estar no SQL |
| `hasResults` | `boolean` | Se deve retornar resultados |
| `minResults` | `number` | Número mínimo de resultados |
| `maxResults` | `number` | Número máximo de resultados |

### Para Responder Agent

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `responseContains` | `string[]` | Palavras que devem estar na resposta |
| `responseNotContains` | `string[]` | Palavras que NÃO devem estar |
| `answersQuestion` | `boolean` | Se responde à pergunta |
| `inPortuguese` | `boolean` | Se resposta está em português |
| `responseLength` | `{ min: number, max?: number }` | Tamanho da resposta |

### Para Orchestrator

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `completes` | `boolean` | Se pipeline completa sem travar |
| `noErrors` | `boolean` | Se não há erros no histórico |
| `agentsRun` | `AgentRole[]` | Quais agents devem executar |
| `suggestionCount` | `number` | Número de sugestões geradas |

Além de todos os critérios acima combinados!

## Tags Recomendadas

### Por Agent
- `interpreter`, `data-query`, `responder`, `suggestion`, `orchestrator`, `mcp`

### Por Complexidade
- `basic`: Casos simples
- `intermediate`: Complexidade média
- `advanced`: Casos complexos

### Por Funcionalidade
- `products`, `customers`, `orders`, `sellers`, `payments`, `reviews`
- `aggregation`, `joins`, `ranking`, `filtering`, `sorting`
- `temporal`, `geography`, `statistics`

### Casos Especiais
- `edge-case`: Casos extremos
- `error-handling`: Tratamento de erros
- `security`: Segurança (SQL injection, etc)
- `multilingual`: Múltiplos idiomas
- `context`: Com histórico de conversa
- `performance`: Testes de performance

## Como Adicionar um Novo Conjunto de Evals

1. **Crie o arquivo de casos:**

```typescript
// src/tests/evals/cases/my-feature.evals.ts
import type { EvalCase } from '../types';

export const myFeatureEvalCases: EvalCase[] = [
  // Seus casos aqui
];
```

2. **Crie o evaluator (se necessário):**

```typescript
// src/tests/evals/evaluators/my-feature.evaluator.ts
import type { IEvaluator, EvalCase, EvalResult } from '../types';

export class MyFeatureEvaluator implements IEvaluator {
  name = 'MyFeatureEvaluator';
  description = 'Evaluates my feature';

  async evaluate(testCase: EvalCase): Promise<EvalResult> {
    // Sua lógica de avaliação
  }

  validateCase(testCase: EvalCase): boolean {
    return true;
  }
}
```

3. **Adicione ao arquivo de testes:**

```typescript
// src/tests/evals/index.test.ts
import { myFeatureEvalCases } from './cases/my-feature.evals';

describe('My Feature Evals', () => {
  test('should evaluate my feature', async () => {
    const runner = new MyFeatureEvalRunner();
    const summary = await runner.run(myFeatureEvalCases);
    expect(summary.passed).toBeGreaterThan(0);
  });
});
```

## Executando Seus Testes

```bash
# Todos os testes
bun test:evals

# Apenas seus testes (por tag)
bun src/tests/evals/cli.ts --tags=my-feature

# Com relatório
bun src/tests/evals/cli.ts --tags=my-feature --report=html

# Verbose para debug
bun src/tests/evals/cli.ts --tags=my-feature --verbose
```

## Dicas e Boas Práticas

1. **IDs Únicos**: Use prefixos consistentes (ex: `interp-`, `data-`, `orch-`)
2. **Nomes Descritivos**: O nome deve deixar claro o que está sendo testado
3. **Tags Apropriadas**: Use tags para facilitar filtros e organização
4. **Expectativas Realistas**: Não seja muito rígido nem muito permissivo
5. **Teste Edge Cases**: Sempre inclua casos extremos e de erro
6. **Documente**: Use descrições claras para explicar casos complexos
7. **Independência**: Cada teste deve ser independente dos outros
8. **Performance**: Use timeouts apropriados para testes mais lentos

## Troubleshooting

### Teste falhando consistentemente

1. Execute com `--verbose` para ver detalhes
2. Verifique se as expectativas são realistas
3. Teste manualmente o mesmo query
4. Ajuste os thresholds se necessário

### Testes lentos

1. Use tags para separar testes lentos
2. Aumente o timeout se necessário
3. Use `--parallel` para executar em paralelo
4. Considere mocks para testes unitários

### Resultados inconsistentes

1. Verifique se há dependências entre testes
2. Use dados determinísticos quando possível
3. Considere variações naturais da IA
4. Ajuste confidence thresholds

## Recursos Adicionais

- [README-EVALS.md](../../../README-EVALS.md): Documentação completa
- [types.ts](../types.ts): Tipos e interfaces
- [metrics.ts](../metrics.ts): Funções de cálculo de métricas
- [runner.ts](../runner.ts): Base class do executor

## Exemplos Reais

Veja os arquivos em `cases/` para exemplos reais:
- `interpreter.evals.ts`: 12 casos de interpretação
- `data-query.evals.ts`: 12 casos de query SQL
- `responder.evals.ts`: 12 casos de resposta
- `orchestrator.evals.ts`: 14 casos end-to-end
